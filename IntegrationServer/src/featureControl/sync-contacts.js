const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
const Mutex = require('async-mutex').Mutex
const populateLock = new Mutex()
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { getBoardItems } = require('../services/monday-service.js')
const fs = require('fs')

/* Import the configVariables from the config-helper.js file. */
const { configVariables } = require('../config/config-helper.js') // List of IDs for the various titles being looked at on Monday.com
const setConfigVariables = require('../config/config-helper.js').setConfigVariables

const conf = './config.json' // CONFIG FILE REFERENCE - this file may not exist, in which case it will be created later

// NOTE:
// Monday will send a duplicate request if it doesn't get a response in 30 seconds.
// This is very much an issue with the populate function, which takes far longer than that to execute.
// This lock varibale is used to prevent multiple sync requests happening simultaniusly

/**
 * It takes the board items from the board that the user selected, and then it either creates a new
 * database of contacts or syncs with an existing database of contacts
 * @param req - The request object
 * @param res - The response object
 */
async function fetchContacts (req, res) {
  const { shortLivedToken } = req.session
  const { boardID } = req.body.payload.inputFields
  const { createNewDatabase } = configVariables

  let release = null
  try {
    const boardItems = await getBoardItems(shortLivedToken, boardID)
    release = await populateLock.acquire() // Mutex lock - Locks sync from triggering again if already running.

    initializeConfig(boardItems)

    switch (createNewDatabase) {
      case true:
        await initalSetupGoogleContacts(boardItems) // Create a NEW database (contacts)
        break
      case false:
        await syncWithExistingContacts(boardItems) // Update EXISTING database (contacts)
        break
      default:
        console.error('Error, config variables corrupt')
        return res.status(500).json({ error: 'Internal Server Error' })
    }

    return res.status(200).send({})
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  } finally {
    if (release) {
      populateLock.release(release)
    }
  }
}

// Name
// Role -> Job Title
// Entity -> Company
// Emails
// Phones    //Don't worry about extentions
// Notes

// Query for etag on update fail.

/**
 * It takes a list of contacts from a database, and creates a new database with the same contacts.
 * @param boardItems - an array of objects that contain the information for each contact.
 * @returns null.
 */
async function initalSetupGoogleContacts (boardItems) { // makes new database.
  let boardItemIndex = 0

  await contactMappingService.deleteDatabse()
  console.log(boardItems.length)

  while (boardItemIndex < boardItems.length) {
    // I have issues with how they are doing this...
    if ((boardItemIndex + 1) % 27 === 0) {
      await sleep(20000)
    }

    const currentItem = boardItems[boardItemIndex]
    const name = currentItem.name
    const arrName = name.split(' ', 2)

    const { arrEmails, arrPhoneNumber, arrNotes, itemID } = parseColumnValues(currentItem, configVariables)
    await service.people.createContact({
      requestBody: {
        names: [
          {
            displayName: name,
            familyName: arrName[1],
            givenName: arrName[0]
          }
        ],
        emailAddresses: arrEmails,
        phoneNumbers: arrPhoneNumber,
        biographies: arrNotes
      }
    }, async (err, res) => {
      if (err) console.error('The API returned an error: ' + err)
      else {
        await contactMappingService.createContactMapping({
          itemID,
          resourceName: res.data.resourceName,
          etag: res.data.etag
        })
      }
    })
    boardItemIndex++
  }
  return null
}

/**
 * Takes in an array of objects, each object representing a row in the board, and updates the
 * contacts in the database with the information contained in the board
 * @param boardItems - An array of objects that contain the data from the board.
 * @returns null.
 */
async function syncWithExistingContacts (boardItems) { // updates existing database.
  console.log('I made it to syncExistingContatcs')
  let boardItemIndex = 0

  while (boardItemIndex < boardItems.length) {
    if ((boardItemIndex + 1) % 14 === 0) {
      await sleep(20000)
    }

    const currentItem = boardItems[boardItemIndex]; const name = currentItem.name
    const arrName = name.split(' ', 2)

    const { arrEmails, arrPhoneNumber, arrNotes, itemID } = parseColumnValues(currentItem, configVariables)
    let itemMapping = await contactMappingService.getContactMapping(itemID)

    if (itemMapping == null) {
      await service.people.createContact({
        requestBody: {
          names: [
            {
              displayName: name,
              familyName: arrName[1],
              givenName: arrName[0]
            }
          ],
          emailAddresses: arrEmails,
          phoneNumbers: arrPhoneNumber,
          biographies: arrNotes
        }
      }, async (err, res) => {
        if (err) console.error('The API returned an error: hi' + err)
        else {
          await contactMappingService.createContactMapping({
            itemID,
            resourceName: res.data.resourceName,
            etag: res.data.etag
          })
        }
      })
    } else {
      service.people.get({
        resourceName: itemMapping.dataValues.resourceName,
        personFields: 'metadata'
      }, async (err, res) => {
        if (err) return console.error('The API returned an error: ' + err)
        else {
          await contactMappingService.updateContactMapping(itemID, { resourceName: res.data.resourceName, etag: res.data.etag })
          const updatedMapping = itemMapping = await contactMappingService.getContactMapping(itemID)

          await service.people.updateContact({
            resourceName: updatedMapping.dataValues.resourceName,
            sources: 'READ_SOURCE_TYPE_CONTACT',
            updatePersonFields: 'biographies,emailAddresses,names,phoneNumbers',
            requestBody: {
              etag: updatedMapping.dataValues.etag,
              names: [
                {
                  givenName: arrName[0],
                  familyName: arrName[1]
                }
              ],
              emailAddresses: arrEmails,
              phoneNumbers: arrPhoneNumber,
              biographies: arrNotes
            }
          }, async (err, res) => {
            if (err) console.error('The API returned an error: ' + err)
            else {
              await contactMappingService.updateContactMapping(itemID, { resourceName: res.data.resourceName, etag: res.data.etag })
            }
          })
        }
      })
    }
    boardItemIndex++
  }
  return null
}

// FUNCTIONS GO HERE
/**
 * Sets up config.json when config.json does not exist. Else it reads the values in config.json
 * @param boardItems - an array of objects that contain the information for each contact.
 * @returns 0 for success, or 1 for error
 */
async function initializeConfig (boardItems) {
  try {
    const boardItemIndex = 0 // pointer for how far into the board to look; which item is being checked
    // Index 0 is the 'headers' of the board - has the column names like "Mobile Phone", "Email - Primary", etc.
    let columnIdConfig = []
    const currentItem = boardItems[boardItemIndex] // container for the current' columns IDs (see above)

    if (!(fs.existsSync(conf))) {
      columnIdConfig = getColumnIdConfig(currentItem, columnIdConfig, boardItemIndex)
      const config = {
        columnIds: columnIdConfig,
        settings: {
          createNewDatabase: false
        }
      }
      await setConfigVariables(config)
      fs.writeFile(conf, JSON.stringify(config), (err) => {
        if (err) { return err }
        console.log('config has been stored')
      })
    } else {
      let config = await fs.readFileSync(conf)
      config = await JSON.parse(config)
      columnIdConfig = getColumnIdConfig(currentItem, columnIdConfig, boardItemIndex)
      config.columnIds = columnIdConfig
      config.settings.createNewDatabase = false

      await setConfigVariables(config)

      fs.writeFile(conf, JSON.stringify(config), (err) => {
        if (err) return err
        console.log('config has been updated')
      })
    }

    return null
  } catch (err) {
    console.error('The initial board configuration has failed: ')
    console.error(err)
    return 1 // Error has occured - TODO: handle in function call
  }
}

/**
 * This function gets the column ids for the columns that have the
 * titles specified in the .env file.
 *
 * @param {object} currentItem
 * @param {array} columnIdConfig
 * @param {number} boardItemIndex
 * @returns {array} columnIdConfig
 */
function getColumnIdConfig (currentItem, columnIdConfig, boardItemIndex) {
  const validTitles = [
    process.env.WORK_PHONE_TITLE,
    process.env.MOBILE_PHONE_TITLE,
    process.env.EMAIL_PRIMARY_TITLE,
    process.env.EMAIL_SECONDARY_TITLE,
    process.env.NOTES_TITLE
  ]

  for (let i = 0; i < currentItem.column_values.length; i++) {
    const currentColumn = currentItem.column_values[i]
    const columnId = currentColumn.id

    if (boardItemIndex === 0 && validTitles.includes(currentColumn.title)) {
      const obj = {
        id: columnId,
        title: currentColumn.title
      }

      columnIdConfig.push(obj)
      console.log(currentColumn.title + ' ' + currentColumn.id)
    }
  }

  return columnIdConfig
}

/**
 * This function parses the column values of a given item and returns an object with the following properties:
 * - arrEmails: An array of objects that contain the email addresses of the given item
 * - arrPhoneNumber: An array of objects that contain the phone numbers of the given item
 * - arrNotes: An array of objects that contain the notes of the given item
 * - itemID: The ID of the given item
 *
 * @param {Object} currentItem - The item whose column values are to be parsed
 * @param {Object} configVariables - An object that contains the IDs of the columns that are to be parsed
 * @returns {Object} An object with the properties described above
 */
function parseColumnValues (currentItem, configVariables) {
  const arrEmails = []
  const arrPhoneNumber = []
  const arrNotes = []
  let itemID = null

  for (const currentColumn of currentItem.column_values) {
    const columnId = currentColumn.id

    switch (columnId) {
      case configVariables.primaryEmailID:
        arrEmails.push({ value: currentColumn.text, type: 'work', formattedType: 'Work' })
        break
      case configVariables.secondaryEmailID:
        arrEmails.push({ value: currentColumn.text, type: 'other', formattedType: 'Other' })
        break
      case configVariables.workPhoneId:
        arrPhoneNumber.push({ value: formatPhoneNumber(currentColumn.text), type: 'work', formattedType: 'Work' })
        break
      case configVariables.mobilePhoneID:
        arrPhoneNumber.push({ value: formatPhoneNumber(currentColumn.text), type: 'mobile', formattedType: 'Mobile' })
        break
      case configVariables.notesID:
        arrNotes.push({ value: currentColumn.text, contentType: 'TEXT_PLAIN' })
        break
      case 'item_id':
        itemID = currentColumn.text
        break
    }
  }

  return {
    arrEmails,
    arrPhoneNumber,
    arrNotes,
    itemID
  }
}


function formatPhoneNumber (number) {
  if (number.length === 10) {
    return `1 (${number.slice(0, 3)}) ${number.substring(3, 6)}-${number.substring(6, 10)}`
  } else {
    return number
  }
}

/**
 * This function will wait for a specified amount of time before continuing with the next line of code.
 * @param ms - The number of milliseconds to wait before resolving the promise.
 * @returns A promise object.
 */
function sleep (ms) {
  console.log('Please wait warmly, APIs are resting')
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

module.exports = {
  fetchContacts
}

const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
const mutex = require('async-mutex').Mutex
const populateLock = new mutex()
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { getBoardItems } = require('../services/monday-service.js')

const { updateContactService } = require('../services/google-services/update-service.js') //API handler for pushing information to existing contacts
const { createContactService } = require('../services/google-services/create-service.js') //API handler for creating and updating contacts

const { parseColumnValues, nameSplit } = require('../util/contact-parser.js') //Information parser

/* Import the configVariables from the config-helper.js file. */
const { configVariables } = require('../config/config-helper.js') // List of IDs for the various titles being looked at on Monday.com
const setConfigVariables = require('../config/config-helper.js').setConfigVariables
const { initializeConfig } = require('../util/config-maker.js')
const conf = './config.json' // CONFIG FILE REFERENCE - this file may not exist, in which case it will be created later

// NOTE:
// Monday will send a duplicate request if it doesn't get a response in 30 seconds, for 30 minutes, or until 200 response.

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

    await initializeConfig(boardItems)

    await syncWithExistingContacts(boardItems) // Create a NEW database (contacts)

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


/**
 * Takes in an array of objects, each object representing a row in the board, and updates the
 * contacts in the database with the information contained in the board
 * @param boardItems - An array of objects that contain the data from the board.
 * @returns null.
 */
async function syncWithExistingContacts (boardItems) { // updates new and existing database.
  console.log('I made it to syncExistingContatcs')
  let boardItemIndex = 0

  while (boardItemIndex < boardItems.length) {
    if ((boardItemIndex + 1) % 14 === 0) {
      await sleep(20000)
    }

    let currentItem = boardItems[boardItemIndex];

    let name = currentItem.name
    let nameArr = await nameSplit(name)
    let { arrEmails, arrPhoneNumbers, arrNotes, itemID } = await parseColumnValues(currentItem)

    let itemMapping = await contactMappingService.getContactMapping(itemID)
    if (itemMapping == null) {
      await createContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
    } else {
      await updateContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
    }
    boardItemIndex++
  }
  return null
}

// FUNCTIONS GO HERE

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

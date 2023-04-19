const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
const Mutex = require('async-mutex').Mutex
const populateLock = new Mutex()
google.options({ auth: OAuth2Client })

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { getBoardItems } = require('../services/monday-service.js')

// API handlers for updating and creating contacts in the People API
const { updateContactService } = require('../services/google-services/update-service.js')
const { createContactService } = require('../services/google-services/create-service.js') 

// Information parser
const { parseColumnValues, nameSplit } = require('../util/contact-parser.js')

/* Import the configVariables from the config-helper.js file. */
// List of IDs for the various titles being looked at on Monday.com
const { configVariables } = require('../config/config-helper.js')
const { initializeConfig } = require('../util/config-maker.js')

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

    initializeConfig(boardItems)

    switch (createNewDatabase) {
      case true:
        await syncWithExistingContacts(boardItems) // Create a NEW database (contacts)
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

/**
 * Takes in an array of objects, each object representing a row in the board, and updates the
 * contacts in the database with the information contained in the board
 * @param boardItems - An array of objects that contain the data from the board.
 * @returns null.
*/
async function syncWithExistingContacts (boardItems) {
  const batchSize = 5
  let batches = []

  for (let i = 0; i < boardItems.length; i += batchSize) {
    batches.push(boardItems.slice(i, i + batchSize))
  }

  for (let batch of batches) {
    let promises = []

    for (let currentItem of batch) {
      promises.push(processContactItem(currentItem))
    }

    await Promise.all(promises)
  }

  return null
}

async function processContactItem(currentItem) {
  const name = currentItem.name
  const nameArr = await nameSplit(name)
  const { arrEmails, arrPhoneNumbers, arrNotes, itemID } = await parseColumnValues(currentItem)

  const itemMapping = await contactMappingService.getContactMapping(itemID)
  if (itemMapping == null) {
    await createContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
  } else {
    await updateContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
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

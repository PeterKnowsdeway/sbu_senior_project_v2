const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
const contactMappingService = require('../services/database-services/contact-mapping-service')
const { createContactService } = require('../services/google-services/create-service.js') // API handler for creating and updating contacts
const { updateContactService } = require('../services/google-services/update-service.js') // API handler for pushing information to existing contacts
const { configVariables } = require('../config/config-helper.js') // List of IDs for the various titles being looked at on Monday.com
const { initializeConfig } = require('../util/config-maker.js')
const { logger } = require('../middleware/logger.js')
const { getBoardItems } = require('../services/monday-service.js')
const { parseColumnValues, nameSplit } = require('../util/contact-parser.js') // Information parser
const Mutex = require('async-mutex').Mutex
const populateLock = new Mutex()
google.options({ auth: OAuth2Client })
const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()

/**
  Fetches board items and synchronizes with contacts database.
  @async
  @function fetchContacts
  @param {Object} req - The request object containing session and payload data.
  @param {Object} res - The response object to send back the result or error.
  @returns {Promise<Object>} - Returns a Promise which resolves to an empty object on success or a JSON error object on failure.
  @throws {Error} - Throws an error if the synchronization fails.
  @description This function fetches board items using the shortLivedToken from the request session, and boardID from the request body's inputFields.
  It then initializes config variables, synchronizes the board items with the existing contacts database based on the  createNewDatabase config variable,
  and returns a successful response or an error response in case of a failure. Uses a Mutex lock to avoid concurrent execution of this function.
*/

async function fetchContacts (req, res) {
  const { shortLivedToken } = req.session
  const { boardId } = req.body.payload.inputFields
  const { createNewDatabase } = configVariables

  let release = null
  try {
    const boardItems = await getBoardItems(shortLivedToken, boardId)

    release = await populateLock.acquire() // Mutex lock - Locks sync from triggering again if already running.
    await initializeConfig(boardItems)

    await syncWithExistingContacts(boardItems) // Create a NEW database (contacts)

    return res.status(200).send({})
  } catch (err) {
    logger.error({
      requestID: ID,
      message: `Error: An error occcured while syncing contacts: ${err}`,
      function: 'fetchContacts',
      params: { createNewDatabase, boardId },
      stacktrace: err.stack
    })
    return res.status(500).json({ error: 'Internal Server Error' })
  } finally {
    if (release) {
      populateLock.release(release)
    }
  }
}

/**
  Synchronizes board items with the existing contacts database.
  @async
  @function syncWithExistingContacts
  @param {Array<Object>} boardItems - The array of board items to synchronize with contacts database.
  @returns {Promise<null>} - Returns a Promise which resolves to null on success.
  @throws {Error} - Throws an error if any item's synchronization fails.
  @description This function takes an array of board items and synchronizes them with the existing contacts database. It loops through each item, parses its column values using the parseColumnValues function, and creates or updates a corresponding contact record in the database using the createContactService or updateContactService function based on whether the item already has a contactMapping in the contactMappingService. It also waits for 30 seconds after every 14th item to avoid rate limiting issues with the API. If any error occurs during the synchronization, it logs the error and throws it.
*/

async function syncWithExistingContacts (boardItems) {
  let boardItemIndex = 0
  while (boardItemIndex < boardItems.length) {
    if ((boardItemIndex + 1) % 14 === 0) {
      await sleep(30000)
    }
    try {
      // Ignore standard JS rule for the code. 'let' is needed for the variables instead of 'const'
      let currentItem = boardItems[boardItemIndex]
      let name = currentItem.name
      let nameArr = await nameSplit(name)
      let { arrEmails, arrPhoneNumbers, arrNotes, itemID } = await parseColumnValues(currentItem)
      let itemMapping = await contactMappingService.getContactMapping(itemID)

      console.log("item num: ", boardItemIndex)
      if (itemMapping == null) {
        await createContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
      } else {
        await updateContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
      }
      boardItemIndex++
    } catch (err) {
      logger.error({
        requestID: ID,
        message: `Error: An error occcured while syncing contacts: ${err}`,
        function: 'syncWithExistingContacts',
        stacktrace: err.stack
      })
      throw err
    }
  }
  return null
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

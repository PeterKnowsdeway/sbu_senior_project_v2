const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { configVariables } = require('../config/config-helper.js')

const { createContactService } = require('../services/google-services/create-service.js') // API handler for creating and updating contacts

const { formatColumnValues, nameSplit } = require('../util/contact-parser.js') // Information parser

const { logger } = require('../middleware/logger.js') // Logging tool

/**
  A function that creates a new contact if the provided itemId is unique.
  @async
  @function
  @param {Object} req - The HTTP request object.
  @param {Object} res - The HTTP response object.
*/

async function makeNewContact (req, res) {
  try {
    // Gets the contact info from monday.com
    const itemMap = req.body.payload.inboundFieldValues.itemMapping
    const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId)

    // Sequilize database. Tries to get itemMapping with the same itemID if it exists for error-handling
    const itemMapping = await contactMappingService.getContactMapping(itemID)

    // Check if item with the given ID alreaady exists
    if (itemMapping !== null) {
      logger.info({
        requestID: ID,
        message: 'Mapping already exists: aborting make contact',
        function: 'makeNewContact',
        params: { itemMapping }
      })
      return res.status(200).send({})
      /**
        if this occurs, there is either an old database-entry with the same itemID somehow.
        e.g. create was called twice, or the itemIDs are repeating.
      */
    } else {
      makeContact(itemID, itemMap)

      return res.status(200).send({})
    }
  } catch (err) {
    logger.error({
      requestID: ID,
      message: `Error creating new contact. Aborting: ${err}`,
      function: 'makeNewContact',
      stacktrace: err.stack
    })
    return res.status(500).send({})
  }
};

/**
  A function that creates a new Google contact with the provided contact information.
  @async
  @function
  @param {string} itemID - The ID of the contact item.
  @param {Object} itemMap - The map containing the contact information.
  @returns {number|Object} Returns 0 if the operation is successful, and an error object otherwise.
*/

async function makeContact (itemID, itemMap) {
  try {
    // Get info
    const name = itemMap.name
    const nameArr = await nameSplit(name)
    const { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap, configVariables)

    // Request Creation
    await createContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)

    return 0
  } catch (err) {
    logger.error({
      requestID: ID,
      message: `Error creating new contact. Aborting: ${err}`,
      function: 'makeNewContact',
      stacktrace: err.stack
    })
    return { error: 'An error occurred while creating the contact. Please try again later.' }
  }
}

module.exports = {
  makeNewContact
}

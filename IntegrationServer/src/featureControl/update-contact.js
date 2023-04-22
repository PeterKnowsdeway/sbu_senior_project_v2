/**
 * This file is responsible for updating the contacts in the Google Contacts API.
 */
const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient

google.options({ auth: OAuth2Client })

const { configVariables } = require('../config/config-helper.js')

// API handler for pushing information to existing contacts
const { updateContactService } = require('../services/google-services/update-service.js')

// Information parser
const { formatColumnValues, nameSplit } = require('../utils/contact-parser.js')

const { logger } = require('../middlewar/logging.js')

/**
 * It takes the data from the webhook, formats it, and then sends it to the update function.
 * @param req - The request object
 * @param res - the response object
 * @returns a promise.
 */
async function updateContactInfo (req, res) {
  const { inboundFieldValues } = req.body.payload
  const itemMap = inboundFieldValues.itemMapping
  const changedColumnId = inboundFieldValues.columnId
  const itemID = JSON.stringify(inboundFieldValues.itemId)

  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID
  } = configVariables

  if ([primaryEmailID, secondaryEmailID, workPhoneID, mobilePhoneID, notesID].includes(changedColumnId)) {
    // Try triggering an update with payload information
    try {
      await updateExisting(itemID, itemMap, updateExisting)
      return res.status(200).send({})
    } catch (err) {
      logger.error({
        message: `Error in update existing contact: ${err.message}`,
        function: 'updateContactInfo',
        params: { itemID, itemMap }
      })
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  } else {
    logger.info({
      message: 'No update to contact',
      function: 'updateContactInfo',
      params: { changedColumnId }
    })
    return res.status(200).send({})
  }
}

/// /FUNCTIONS////

/*
 * When called, will push information for the titles located in the env with specified item information
 * @param itemID - specifies the item that has been changed
 * @param itemMap - contains the information to update object - req payload from monday.com
 * updateExisting will be called with the updated information
 */
async function updateExisting (itemID, itemMap) {
  try {
    const name = itemMap.name
    const nameArr = await nameSplit(name)
    const { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap)

    await updateContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
  } catch (err) {
    logger.error({
      message: `Error updating contact: ${err.message}`,
      function: 'updateExisting',
      params: { itemID, itemMap }
    })
    throw err
  }
}

module.exports = {
  updateContactInfo
}

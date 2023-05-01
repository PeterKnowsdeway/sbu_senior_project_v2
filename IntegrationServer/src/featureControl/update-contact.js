const { google } = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient;
const { v4: uuidv4 } = require('uuid');
google.options({auth: OAuth2Client});

const service = google.people({version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const { configVariables } = require('../config/config-helper.js');

const { updateContactService } = require('../services/google-services/update-service.js') //API handler for pushing information to existing contacts

const { formatColumnValues, nameSplit } = require('../util/contact-parser.js') //Information parser

const { logger } = require('../middleware/logger.js')
const ID = uuidv4();


/**
  Updates the contact information in the database based on the data provided in the request body.
  @async
  @function
  @param {Object} req - The request object containing the payload with the updated contact information.
  @param {Object} res - The response object to be sent back to the client.
  @returns {Object} - The updated contact information in the database or an error message.
  @throws {Error} - If there is an error updating the contact information in the database.
*/
async function updateContactInfo(req, res) {
	const { inboundFieldValues } = req.body.payload;
  const itemMap = inboundFieldValues.itemMapping;
  const changedColumnId = inboundFieldValues.columnId;
  const itemID = JSON.stringify(inboundFieldValues.itemId);

	const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;

  if ([primaryEmailID, secondaryEmailID, workPhoneID, mobilePhoneID, notesID].includes(changedColumnId)) {
		try { //Try triggering an update with payload information
			await updateExisting(itemID, itemMap, updateExisting);
      return res.status(200).send({})
		} catch(err) { //Error
			logger.error({
        pid: process.pid,
        requestID: ID,
        message: `Error: An error occcured while updating contacts: ${err}`,
        function: 'updateContactInfo',
        params: { itemID, itemMap },
        stacktrace: err.stack
      })
      throw err
		}
		return res.status(409).send({});
	} else { //Column not a synced title
		logger.error({
      pid: process.pid,
      requestID: ID,
      message: `Error: column not a synced title`,
      function: 'updateContactInfo',
      params: { itemID, itemMap },
    })
		return res.status(200).send({});
	}
}

/**
  Updates an existing contact in the database with the provided information.
  @async
  @function
  @param {string} itemID - The ID of the contact to be updated.
  @param {Object} itemMap - An object containing the updated contact information to be used to update the contact.
  @returns {number} - 0 if the contact was updated successfully, or an error if there was a problem updating the contact.
  @throws {Error} - If there is an error updating the contact information in the database.
*/
async function updateExisting (itemID, itemMap) {
  try {
    // Get info
    const name = itemMap.name
    const nameArr = await nameSplit(name)
    let { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap)
    await updateContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
  } catch(error){
    logger.error({
      pid: process.pid,
      requestID: ID,
      message: `Error: An error occcured while updating contacts: ${err}`,
      function: 'updateExisting',
      params: { name, nameArr, arrEmails, arrPhoneNumber, arrNotes },
      stacktrace: err.stack
    })
    throw err
  }

  return 0
}

module.exports = {
  updateContactInfo
};
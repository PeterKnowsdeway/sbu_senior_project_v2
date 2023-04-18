/**
 * This file is responsible for updating the contacts in the Google Contacts API.
 * It is called by the webhook when a contact is updated in the Airtable.
 */
const { google } = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient;

google.options({auth: OAuth2Client});

const service = google.people({version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const { configVariables } = require('../config/config-helper.js');

const { updateContactService } = require('../services/google-services/update-service.js') //API handler for pushing information to existing contacts

const { formatColumnValues, nameSplit } = require('../util/contact-parser.js') //Information parser

/**
 * It takes the data from the webhook, formats it, and then sends it to the update function.
 * @param req - The request object
 * @param res - the response object
 * @returns a promise.
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
			console.log("Catch block1 err: " + err);
		}
		return res.status(409).send({});
	} else { //Column not a synced title
		console.log("no change on update");
		return res.status(200).send({});
	}
}

////FUNCTIONS////

/*
 * When called, will push information for the titles located in the env with specified item information
 * @param itemID - specifies the item that has been changed
 * @param itemMap - contains the information to update object - req payload from monday.com
 * @param [callback] - what function to call in case of failure
 *        // TODO: CHECK callback param: is this something to replace with a const variable due to possible security concerns?
 */
async function updateExisting (itemID, itemMap) { // updates existing database.

  //Get info
  const name = itemMap.name
  const nameArr = await nameSplit(name)
  let { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap)

  //Request update
  try{
    await updateContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
  } catch(error){
    return error
  }

  return 0
}

module.exports = {
  updateContactInfo
};


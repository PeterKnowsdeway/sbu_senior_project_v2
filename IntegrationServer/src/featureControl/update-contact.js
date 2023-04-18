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

const { updateContactService } = require('../services/google-services/update-service.js')

const { formatPhoneNumber } = require('../utils/formatPhoneNumber.js');

const { nameSplit } = require('../utils/nameSplit.js');

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

	console.log(JSON.stringify(inboundFieldValues));

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


/**
 * When called, will push information for the titles located in the env are for the specified item 
 * @param itemID - specifies the item that has been changed
 * @param itemMap - contains the information to update object - req payload from monday.com
 * @param [callback] - what function to call in case of failure
 *        // TODO: CHECK callback param: is this something to replace with a const variable due to possible security concerns?
 */
async function updateExisting (itemID, itemMap) { // updates existing database.

  const name = itemMap.name
  const nameArr = await nameSplit(name)
  let { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap, configVariables)

  await updateContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)

  return 0
}

async function formatColumnValues (itemMap) {
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;
  let workPhone = await formatPhoneNumbers(itemMap[workPhoneID]);
  let mobilePhone = await formatPhoneNumbers(itemMap[mobilePhoneID]);
  const primaryEmail = itemMap[primaryEmailID];
  const secondaryEmail = itemMap[secondaryEmailID];
  const notes = itemMap[notesID];

  let arrEmails= []
  let arrPhoneNumbers=[]
  let arrNotes = []

  arrEmails.push({ value: primaryEmail, type: 'work', formattedType: 'Work' })
  arrEmails.push({ value: secondaryEmail, type: 'other', formattedType: 'Other' })
  arrPhoneNumbers.push({ value: workPhone, type: 'work', formattedType: 'Work' })
  arrPhoneNumbers.push({ value: mobilePhone, type: 'mobile', formattedType: 'Mobile' })
  arrNotes.push({ value: notes, contentType: 'TEXT_PLAIN' })

  return {
    arrEmails,
    arrPhoneNumbers,
    arrNotes,
  }
}

module.exports = {
	updateContactInfo,
};


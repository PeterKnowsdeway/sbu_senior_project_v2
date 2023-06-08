const { google } = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient;
google.options({auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');
const { configVariables } = require('../config/config-helper.js');

const { updateContactService } = require('../services/google-services/update-service.js') 
const { formatColumnValues, nameSplit } = require('../util/contact-parser.js') 

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
		try { 
			await updateExisting(itemID, itemMap, updateExisting);
      return res.status(200).send({})
		} catch(err) { //Error
			console.log("Catch block1 err: " + err);
		}
		return res.status(409).send({});
	} else { 
		console.log("no change on update");
		return res.status(200).send({});
	}
}

async function updateExisting (itemID, itemMap) {
  const name = itemMap.name
  const nameArr = await nameSplit(name)
  let { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap)

  try{
    await updateContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
  } catch(error){
    return error
  }
}

module.exports = {
  updateContactInfo
};

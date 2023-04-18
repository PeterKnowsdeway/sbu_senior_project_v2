/*
  This file is the main file for creating a new contact.
  It is called by the monday.com webhook.
  It is responsible for creating a new contact in Google Contacts, and storing the information about the contact in   the database.
  It is also responsible for error-handling.
*/

const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { configVariables } = require('../config/config-helper.js')

const { formatPhoneNumber } = require('../utils/formatPhoneNumber.js');
const { nameSplit } = require('../utils/nameSplit.js');
const { createContactService } = require('../services/google-services/create-service')

async function makeNewContact(req, res) {
  try {
    //gets the contact info from monday.com
    const itemMap = req.body.payload.inboundFieldValues.itemMapping;
    const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);

    //Sequilize database. Tries to get itemMapping with the same itemID if it exists for error-handling
    const itemMapping = await contactMappingService.getContactMapping(itemID);

     // Check if item with the given ID alreaady exists
     // if this occurs, there is either an old database-entry with the same itemID somehow. 
    // e.g. create was called twice, or the itemIDs are repeating.
    if (itemMapping != null) {
      console.log("A contact with the given ID already exists, cannot create a new contact");
      return res.status(200).send({});
    } 

    const contactRes = makeContact(itemId, itemMapping);
    return res.status(200).send({});
    
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).send({});
  }
};

async function makeContact(itemID, itemMap) {
  // Get name and the IDs of the Title Fields that exist from contactMappingService
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;
  const name = itemMap.name;
  let nameArr = await nameSplit(name);
  let { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap, configVariables)

  
  await createContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
  
  return 0;
}

/*
//WIP - No implemented.
//Intended for in case functionality with createMappingService is split from the createContact case for readability reasons.
async function newMapping(itemID, resourceName, etag) {
  await contactMappingService.createContactMapping({
    itemID,
    resourceName: resourceName, 
    etag: etag
  });
}
*/

async function formatColumnValues (itemMap) {
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;
  let workPhone = await formatPhoneNumber(itemMap[workPhoneID]);
  let mobilePhone = await formatPhoneNumber(itemMap[mobilePhoneID]);
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

  console.log("Emails: ", arrEmails)
  console.log("Phones: ", arrPhoneNumbers)
  console.log("Notes: ", arrNotes)

  return {
    arrEmails,
    arrPhoneNumbers,
    arrNotes,
  }
}

module.exports = {
  makeNewContact
};

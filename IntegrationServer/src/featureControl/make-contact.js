const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { configVariables } = require('../config/config-helper.js')

const { formatPhoneNumber } = require('../utils/formatPhoneNumber.js');
const { nameSplit } = require('../utils/nameSplit.js');
const { createContactService } = require('../services/google-services/create-service')

async function makeNewContact (req, res) {
  try {
    // gets the contact info from monday.com
    const itemMap = req.body.payload.inboundFieldValues.itemMapping
    const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId)

    // Sequilize database. Tries to get itemMapping with the same itemID if it exists for error-handling
    const itemMapping = await contactMappingService.getContactMapping(itemID)

    if (itemMapping !== null) { // Check if item with the given ID alreaady exists
      console.log('Mapping already exists: aborting make contact')
      return res.status(200).send({})
      // if this occurs, there is either an old database-entry with the same itemID somehow. e.g. create was called twice, or the itemIDs are repeating.
    } else { // No contact exists
      makeContact(itemID, itemMap)

      return res.status(200).send({})
    }
  } catch (error) {
    console.error('An error occurred:', error)
    return res.status(500).send({})
  }
};

async function makeContact (itemID, itemMap) {
  // Get name and the IDs of the Title Fields that exist from contactMappingService
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID
  } = configVariables
  const name = itemMap.name
  const primaryEmail = itemMap[primaryEmailID]
  const secondaryEmail = itemMap[secondaryEmailID]
  const notes = itemMap[notesID]
  const nameArr = await nameSplit(name)
  const workPhone = await formatPhoneNumber(itemMap[workPhoneID])
  const mobilePhone = await formatPhoneNumber(itemMap[mobilePhoneID])

  await createContactService(name, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes, resourceName, etag);
  return 0
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

module.exports = {
  makeNewContact
}

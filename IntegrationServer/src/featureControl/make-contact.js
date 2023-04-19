/*
  This file is the main file for creating a new contact.
  It is called by the monday.com webhook.
  It is responsible for creating a new contact in Google Contacts, and storing the information about the contact in   the database.
  It is also responsible for error-handling.
*/

const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { configVariables } = require('../config/config-helper.js')

const { createContactService } = require('../services/google-services/create-service')
const { formatColumnValues, nameSplit } = require('../util/contact-parser.js') // Information parser

async function makeNewContact (req, res) {
  try {
    // gets the contact info from monday.com
    const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId)

    // Sequilize database. Tries to get itemMapping with the same itemID if it exists for error-handling
    const itemMapping = await contactMappingService.getContactMapping(itemID)

    // Check if item with the given ID alreaady exists
    // if this occurs, there is either an old database-entry with the same itemID somehow.
    // e.g. create was called twice, or the itemIDs are repeating.
    if (itemMapping != null) {
      console.log('A contact with the given ID already exists, cannot create a new contact')
      return res.status(200).send({})
    }

    await makeContact(itemID, itemMapping)
    return res.status(200).send({})
  } catch (error) {
    console.error('Internal Server Error:', error)
    return res.status(500).send({})
  }
};

async function makeContact (itemID, itemMap) {
  // Get info
  const name = itemMap.name
  const nameArr = await nameSplit(name)
  const { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap, configVariables)

  // Request Creation
  await createContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
}

module.exports = {
  makeNewContact
}

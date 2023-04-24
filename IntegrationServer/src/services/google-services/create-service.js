/*
  This file is responsible for making calls to the Google People API.
  It is used to create contacts.
*/
const { google } = require('googleapis')
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../database-services/contact-mapping-service')
const logger = require('../../middleware/logging.js')

async function createContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID) {
  // calls the people api to create a contact with any information that has been put into the new contact.
  // Normally should just be the name
  await service.people.createContact({
    requestBody: { // info to push to Google as new contact
      names: [
        {
          displayName: name,
          givenName: nameArr[0],
          middleName: nameArr[1],
          familyName: nameArr[2]
        }
      ],
      emailAddresses: arrEmails,
      phoneNumbers: arrPhoneNumbers,
      biographies: arrNotes
    } // end request body
  }, async (err, res) => {
    if (err) {
      logger.error({
        message: `Error creating contact in People API ${err}`,
        function: 'createContactService',
        params: { name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID },
        error: err.stack
      })
    }
    // Create internal contact mapping for database
    try {
      await contactMappingService.createContactMapping({
        itemID,
        resourceName: res.data.resourceName,
        etag: res.data.etag
      })
    } catch (err) {
      logger.error({
        message: `Error creating contact in database ${err}`,
        function: 'createContactService',
        params: { itemID, resourceName, etag },
        error: err.stack
      })
    }
  })
  return 0
}

module.exports = {
  createContactService
}

/*
  This file is responsible for making calls to the Google People API.
  It is used to create contacts.
*/
const { google } = require('googleapis')
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../database-services/contact-mapping-service')

async function createContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID) {
  // calls the people api to create a contact with any information that has been put into the new contact.
  // Normally should just be the name
  const res = await service.people.createContact({
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
      return console.error('The API returned an error: ' + err)
    }
    // Create internal contact mapping for database
    await contactMappingService.createContactMapping({
      itemID,
      resourceName: res.data.resourceName,
      etag: res.data.etag
    })
  })
  return 0
}

module.exports = {
  createContactService
}

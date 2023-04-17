const { google } = require('googleapis')
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
const fs = require('fs')
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../database-services/contact-mapping-service')

 // calls the people api to create a contact with any information that has been put into the new contact.
// Normally should just be the name
async function createContactService(name, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes) {
  await service.people.createContact(
    {
      requestBody: {
        // info to push to Google as new contact
        names: [
          {
            displayName: name,
            familyName: nameArr[2],
            givenName: nameArr[0],
            middleName: nameArr[1]
          }
        ],
        emailAddresses: [
          {
            value: primaryEmail,
            type: 'work',
            formattedType: 'Work'
          },
          {
            value: secondaryEmail,
            type: 'other',
            formattedType: 'Other'
          }
        ],
        phoneNumbers: [
          {
            value: workPhone,
            type: 'work',
            formattedType: 'Work'
          },
          {
            value: mobilePhone,
            type: 'mobile',
            formattedType: 'Mobile'
          }
        ],
        biographies: [
          {
            value: notes,
            contentType: 'TEXT_PLAIN'
          }
        ]
      } // end request body
    },
    async (err, res) => {
      if (err) {
        return console.error('The API returned an error: ' + err)
      }
      // Create internal contact mapping for database
      await contactMappingService.createContactMapping({
        itemID,
        resourceName: res.data.resourceName,
        etag: res.data.etag
      })
    }
  )
}

module.exports = {
  createContactService
}
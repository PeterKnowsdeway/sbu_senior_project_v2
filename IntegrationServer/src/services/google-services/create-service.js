const { google } = require('googleapis')
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
const service = google.people( {version: 'v1', auth: OAuth2Client})
const contactMappingService = require('../database-services/contact-mapping-service')

google.options({auth: OAuth2Client})

/**
 * Creates a new contact in Google People API and creates an internal contact mapping in the database.
 * @async
 * @function createContactService
 * @param {string} name - The display name of the contact.
 * @param {Array.<string>} nameArr - An array of strings containing the given name, middle name, and family name of the contact.
 * @param {Array.<Object>} arrEmails - An array of objects containing email address information for the contact.
 * @param {Array.<Object>} arrPhoneNumbers - An array of objects containing phone number information for the contact.
 * @param {Array.<Object>} arrNotes - An array of objects containing note information for the contact.
 * @param {string} itemID - The ID of the item associated with the contact.
 * @returns {number} - Returns 0 after completing the function.
*/

async function createContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID) {
  const res = await service.people.createContact({
    requestBody: {
      names: [
            {
              displayName: name,
              givenName: nameArr[0],
              middleName: nameArr[1],
              familyName: nameArr[2],
            }
          ],
          emailAddresses: arrEmails,
          phoneNumbers: arrPhoneNumbers,
          biographies: arrNotes
    } 
  }, async (err, res) => {
    if (err) {
      return console.error('The API returned an error: ' + err)
    }
    await contactMappingService.createContactMapping({
      itemID,
      resourceName: res.data.resourceName, 
      etag: res.data.etag
    })
  })
}

module.exports = {
  createContactService
}


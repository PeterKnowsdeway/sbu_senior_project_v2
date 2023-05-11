const { google } = require('googleapis');
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
google.options({auth: OAuth2Client});

const service = google.people( {version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../database-services/contact-mapping-service');

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
 *
 * @mermaid
 *  flowchart TD;
 *    A[Start] --> B{Input Parameters}
 *    B --> C[Create Contact with People API]
 *    C --> D{Handle Error}
 *    D -->|Yes| E[Return Error]
 *    D -->|No| F[Create Internal Contact Mapping]
 *    F --> G[Return 0]
 */

async function createContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID) {

  // Calls the people api to create a contact with any information that has been put into the new contact. 
  // Normally should just be the name
  const res = await service.people.createContact({
    requestBody: { //info to push to Google as new contact
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
    // Create internal contact mapping for database
    await contactMappingService.createContactMapping({
      itemID,
      resourceName: res.data.resourceName, 
      etag: res.data.etag
    });
  });
  return 0;
}

module.exports = {
  createContactService
}


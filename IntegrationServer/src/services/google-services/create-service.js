const { google } = require('googleapis')
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })
const service = google.people({ version: 'v1', auth: OAuth2Client })
const contactMappingService = require('../database-services/contact-mapping-service')
const { logger } = require('../../middleware/logger.js')
const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()

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
async function createContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID) {
  const res = await service.people.createContact({
    requestBody: {
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
    }
  }, async (err, res) => {
    if (err) {
      logger.error({
        requestID: ID,
        message: `Error: An error occured while creating a contact with the PeopleAPI ${err}`,
        function: 'createContactService',
        stacktrace: err.stack
      })
      return res.status(500).json({ error: 'The People API returned an error' })
    }
    // Create internal contact mapping for database
    try {
      await contactMappingService.createContactMapping({
        itemID,
        resourceName: res.data.resourceName,
        etag: res.data.etag
      })
    } catch (error) {
      logger.error({
        requestID: ID,
        message: `Error: An error occured while creating a contact mapping in the database: ${err}`,
        function: 'createContactService',
        stacktrace: err.stack
      })
      return res.status(500).json({ error: 'The API returned an error' })
    }
  })
  return res.status(201).json({ info: 'Success! Contact created' })
}

module.exports = {
  createContactService
}

const { google } = require('googleapis')
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })
const service = google.people({ version: 'v1', auth: OAuth2Client })
const contactMappingService = require('../database-services/contact-mapping-service')
const { logger } = require('../../middleware/logger.js')
const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()

/**
  Updates an existing contact in Google People API and updates the internal contact mapping in the database
  @async
  @function updateContactService
  @param {string} name - The display name of the contact
  @param {Array.<string>} nameArr - The array containing the first, middle and last names of the contact respectively
  @param {Array.<Object>} arrEmails - The array containing the email addresses of the contact
  @param {Array.<Object>} arrPhoneNumbers - The array containing the phone numbers of the contact
  @param {Array.<Object>} arrNotes - The array containing the biographies of the contact
  @param {number} itemID - The ID of the contact to be updated
  @returns {null}
*/
async function updateContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID) {
  let itemMapping = await contactMappingService.getContactMapping(itemID)
  service.people.get({
    resourceName: itemMapping.dataValues.resourceName,
    personFields: 'metadata'
  }, async (err, res) => {
    if (err) {
      logger.error({
        requestID: ID,
        message: `Error: An error occcured while updating contact: ${err}`,
        function: 'updateContactService',
        stacktrace: err.stack
      })
      return res.status(404).json({ error: 'The People API returned an error' })
    } else {
      let updatedMapping = await contactMappingService.getContactMapping(itemID)
      await service.people.updateContact({
        resourceName: updatedMapping.dataValues.resourceName,
        sources: 'READ_SOURCE_TYPE_CONTACT',
        updatePersonFields: 'biographies,emailAddresses,names,phoneNumbers',
        requestBody: {
          etag: updatedMapping.dataValues.etag,
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
            message: `Error: An error occcured while updating contact: ${err}`,
            function: 'updateContactService',
            stacktrace: err.stack
          })
          return res.status(500).json({ error: 'The People API returned an error' })
        } else {
          await contactMappingService.updateContactMapping(itemID, { resourceName: res.data.resourceName, etag: res.data.etag })
        }
        return res.status(201).json({ info: 'Success' })
      })
    }
  })
}

module.exports = {
  updateContactService
}

/*
This file is responsible for the following:
- Updating a contact on Google Contacts
*/

const { google } = require('googleapis')
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../database-services/contact-mapping-service')
const logger = require('../../middleware/logging.js')

/**
 * When called, will push information for the titles located in the env are for the specified item
 * @param itemID - specifies the item that has been changed
 * @param itemMap - contains the information to update object - req payload from monday.com
 * @param [callback] - what function to call in case of failure
 *        // TODO: CHECK callback param: is this something to replace with a const variable due to possible security concerns?
 */

// Updates existing database
async function updateContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID) {
  const itemMapping = await contactMappingService.getContactMapping(itemID)

  service.people.get({
    resourceName: itemMapping.dataValues.resourceName,
    personFields: 'metadata'
  }, async (err, res) => {
    if (err) {
      logger.error({
        message: `Error retreiving contact with People API ${err}`,
        function: 'updateContactService',
        params: { name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID },
        error: err.stack
      })
    } else {
      const updatedMapping = await contactMappingService.getContactMapping(itemID)
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
            message: `Error updating contact in People API: ${err}`,
            function: 'updateContactService',
            params: { name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID },
            error: err.stack
          })
        } else {
          try {
            await contactMappingService.updateContactMapping(itemID, { resourceName: res.data.resourceName, etag: res.data.etag })
          } catch (err) {
            logger.error({
              message: `Error updating contact in database: ${err}`,
              function: 'updateContactService',
              params: { itemID },
              error: err.stack
            })
          }
        }
      })
    }
  })
  return null
}

module.exports = {
  updateContactService
}

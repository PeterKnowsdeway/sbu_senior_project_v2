const { google } = require('googleapis')
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
const fs = require('fs')
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../database-services/contact-mapping-service')

async function createContact(name, nameArr, arrEmails, arrPhoneNumber, arrNotes, itemID) {
  await service.people.createContact({
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
      phoneNumbers: arrPhoneNumber,
      biographies: arrNotes
    }
  }, async (err, res) => {
    if (err) console.error('The API returned an error: hi' + err)
    else {
      await contactMappingService.createContactMapping({
        itemID,
        resourceName: res.data.resourceName,
        etag: res.data.etag
      })
    }
  })
}

async function updateContact (itemID, name, nameArr, arrEmails, arrPhoneNumber, arrNotes) {
  
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
          familyName: nameArr[2],
        }
      ],
      emailAddresses: arrEmails,
      phoneNumbers: arrPhoneNumber,
      biographies: arrNotes
    }
  }, async (err, res) => {
    if (err) console.error('The API returned an error: ' + err)
    else {
      await contactMappingService.updateContactMapping(itemID, { resourceName: res.data.resourceName, etag: res.data.etag })
    }
  })
}


module.exports = {
  createContact,
  updateContact
}
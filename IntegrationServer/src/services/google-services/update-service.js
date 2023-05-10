const { google } = require('googleapis');
const OAuth2Client = require('../../OAuth/google-auth.js').OAuthClient
google.options({auth: OAuth2Client});

const service = google.people( {version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../database-services/contact-mapping-service');


/**
 * When called, will push information for the titles located in the env are for the specified item 
 * @param itemID - specifies the item that has been changed
 * @param itemMap - contains the information to update object - req payload from monday.com
 * @param [callback] - what function to call in case of failure
 *        // TODO: CHECK callback param: is this something to replace with a const variable due to possible security concerns?
 */
async function updateContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID) { // updates existing database.

  let itemMapping = await contactMappingService.getContactMapping(itemID)

  service.people.get({
    resourceName: itemMapping.dataValues.resourceName,
    personFields: 'metadata'
  }, async (err, res) => {
    if (err) return console.error('The API returned an error at update1: ' + err)
    else {
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
          phoneNumbers: arrPhoneNumbers,
          biographies: arrNotes
        }
      }, async (err, res) => {
        if (err) console.error('The API returned an error at update2: ' + err)
        else {
          await contactMappingService.updateContactMapping(itemID, { resourceName: res.data.resourceName, etag: res.data.etag })
        }
      })//end inner service
    }
  }) //end outer service
  return null
}

async function nameSplit(name) {
    let nameArr = await name.split(" ");

  //If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
  switch (nameArr.length == 2) {
    case 1 :
        nameArr[1]= "";
        nameArr[2]= "";
        break;
    case 2 :
        nameArr[2] = nameArr[1];
        nameArr[1] = "";
        break;
    case 3 :
      break;
  }
  return nameArr;
}

module.exports = {
  updateContactService
}
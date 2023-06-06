const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
const contactMappingService = require('../services/database-services/contact-mapping-service')
const { configVariables } = require('../config/config-helper.js')
const { createContactService } = require('../services/google-services/create-service.js')
const { formatColumnValues, nameSplit } = require('../util/contact-parser.js')

google.options({auth: OAuth2Client})

async function makeNewContact(req, res) {
  try {
    const itemMap = req.body.payload.inboundFieldValues.itemMapping;
    const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId)

    const itemMapping = await contactMappingService.getContactMapping(itemID)

    if (itemMapping != null) {
      console.log("Mapping already exists: aborting make contact")
      return res.status(200).send({})
    } else {
      const contactRes = makeContact(itemID, itemMap)
      return res.status(200).send({})
    }
  } catch (error) {
    console.error('An error occurred:', error)
    return res.status(500).send({})
  }
}

async function makeContact(itemID, itemMap) {
  const name = itemMap.name;
  const nameArrPromise = nameSplit(name);
  const { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap, configVariables);

  let nameArr;
  try {
    nameArr = await nameArrPromise;
  } catch (error) {
    throw new Error('Unable to format name or invalid data was passed')
  }

  try {
    await createContactService(name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID);
  } catch (error) {
    return error;
  }
}


module.exports = {
  makeNewContact
};
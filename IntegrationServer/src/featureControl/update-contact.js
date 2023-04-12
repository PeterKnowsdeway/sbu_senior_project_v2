const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { configVariables } = require('../config/config-helper.js')

/**
 * It takes the data from the webhook, formats it, and then sends it to the update function.
 * @param req - The request object
 * @param res - the response object
 * @returns a promise.
 */
async function updateContactInfo (req, res) {
  const itemMap = req.body.payload.inboundFieldValues.itemMapping
  const changedColumnId = req.body.payload.inboundFieldValues.columnId
  const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId)

  console.log(JSON.stringify(req.body.payload.inboundFieldValues))

  if (changedColumnId === configVariables.primaryEmailID || changedColumnId === configVariables.secondaryEmailID || changedColumnId === configVariables.workPhoneId || changedColumnId === configVariables.mobilePhoneID || changedColumnId === configVariables.notesID) {
    const name = itemMap.name
    const primaryEmail = itemMap[configVariables.primaryEmailID]
    const secondaryEmail = itemMap[configVariables.secondaryEmailID]
    let workPhone = itemMap[configVariables.workPhoneId]
    let mobilePhone = itemMap[configVariables.mobilePhoneID]
    const notes = itemMap[configVariables.notesID]

    // Splits the contact into an array to seperate first, middle, last
    // If there is only a first the other values will be undifined which the api call can handle
    const nameArr = await name.split(' ')
    // If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
    if (nameArr.length === 2) {
      nameArr[2] = nameArr[1]
      nameArr[1] = ''
    }

    // Try to format moble and work phones
    if (workPhone !== undefined) {
      console.log(workPhone)
      if (workPhone.length === 10) {
        workPhone = await '1 (' + workPhone.slice(0, 3) + ') ' + workPhone.substring(3, 6) + '-' + workPhone.substring(6, 10)
      }
    }
    if (mobilePhone !== undefined) {
      console.log(mobilePhone)
      if (mobilePhone.length === 10) {
        mobilePhone = await '1 (' + mobilePhone.slice(0, 3) + ') ' + mobilePhone.substring(3, 6) + '-' + mobilePhone.substring(6, 10)
      }
    }
    try {
      const { resourceName, etag } = await contactMappingService.getContactMapping(itemID)
      await update(resourceName, etag, itemID, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes, update)
    } catch (err) {
      console.log('Catch block err: ' + err)
    }
    return res.status(200).send({})
  } else {
    console.log('no change')
    return res.status(200).send({})
  }
}

/**
 * Takes in a bunch of parameters, and then it calls the Google People API to update a contact.
 * @param resourceName - The resource name of the contact to update.
 * @param etag - The etag of the contact.
 * @param itemID - The ID of the contact in the database
 * @param nameArr - an array of strings, where the first element is the first name, the second element
 * is the middle name, and the third element is the last name.
 * @param primaryEmail - the primary email address of the contact
 * @param secondaryEmail - "test@test.com"
 * @param workPhone - +1-555-555-5555
 * @param mobilePhone - +1-555-555-5555
 * @param notes - a string
 * @param [callback] - a function that will be called if the update fails.
 */
async function update (resourceName, etag, itemID, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes, callback = undefined) {
  await service.people.updateContact({
    resourceName,
    sources: 'READ_SOURCE_TYPE_CONTACT',
    updatePersonFields: 'biographies,emailAddresses,names,phoneNumbers',
    requestBody: {
      etag,
      names: [
        {
          givenName: nameArr[0],
          middleName: nameArr[1],
          familyName: nameArr[2]
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
    }
  }, async (err, res) => {
    if (err) {
      console.log('The API returned an error: ' + err)
      service.people.get({
        resourceName,
        personFields: 'metadata'
      }, (err, res) => {
        if (err) return console.error('The API returned an error: ' + err)
        if (callback) callback(res.data.resourceName, res.data.etag, itemID, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes)
      })
    } else {
      await contactMappingService.updateContactMapping(itemID, { resourceName: res.data.resourceName, etag: res.data.etag })
    }
  }
  )
}

module.exports = {
  updateContactInfo
}

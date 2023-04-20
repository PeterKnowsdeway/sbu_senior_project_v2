
const { configVariables } = require('../config/config-helper.js')

async function nameSplit (name) {
  const nameParts = name.trim().split(/\s+/) // Split on one or more whitespace characters

  // Limit the name to at most three parts
  if (nameParts.length > 3) {
    nameParts.splice(3)
  }

  // If there is no middle name, shift the last name to the middle name position
  if (nameParts.length === 2) {
    nameParts.splice(1, 0, '')
  }

  return nameParts
}

async function phoneFormat (phone) {
  // Try to format mobile and work phones
  if (phone !== undefined) {
    console.log(phone)
    if (phone.length === 10) {
      phone = await '1 (' + phone.slice(0, 3) + ') ' + phone.substring(3, 6) + '-' + phone.substring(6, 10)
      return phone
    }
  }
}

async function formatColumnValues (itemMap, configVariables) {
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;

  let workPhone = await phoneFormat(itemMap[workPhoneID]);
  let mobilePhone = await phoneFormat(itemMap[mobilePhoneID]);
  const primaryEmail = itemMap[primaryEmailID];
  const secondaryEmail = itemMap[secondaryEmailID];
  const notes = itemMap[notesID];

  let arrEmails= []
  let arrPhoneNumbers=[]
  let arrNotes = []

  arrEmails.push({ value: primaryEmail, type: 'work', formattedType: 'Work' })
  arrEmails.push({ value: secondaryEmail, type: 'other', formattedType: 'Other' })
  arrPhoneNumbers.push({ value: workPhone, type: 'work', formattedType: 'Work' })
  arrPhoneNumbers.push({ value: mobilePhone, type: 'mobile', formattedType: 'Mobile' })
  arrNotes.push({ value: notes, contentType: 'TEXT_PLAIN' })

  return {
    arrEmails,
    arrPhoneNumbers,
    arrNotes,
  }
}

async function parseColumnValues (currentItem, configVariables) {
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID
  } = configVariables

  const arrEmails = []
  const arrPhoneNumbers = []
  const arrNotes = []
  let itemID = null

  for (const currentColumn of currentItem.column_values) {
    const columnId = currentColumn.id

    switch (columnId) {
      case primaryEmailID:
        arrEmails.push({ value: currentColumn.text, type: 'work', formattedType: 'Work' })
        break
      case secondaryEmailID:
        arrEmails.push({ value: currentColumn.text, type: 'other', formattedType: 'Other' })
        break
      case workPhoneID:
        arrPhoneNumbers.push({ value: await phoneFormat(currentColumn.text), type: 'work', formattedType: 'Work' })
        break
      case mobilePhoneID:
        arrPhoneNumbers.push({ value: await phoneFormat(currentColumn.text), type: 'mobile', formattedType: 'Mobile' })
        break
      case notesID:
        arrNotes.push({ value: currentColumn.text, contentType: 'TEXT_PLAIN' })
        break
      case 'item_id':
        itemID = currentColumn.text
        break
    }
  }

  return {
    arrEmails,
    arrPhoneNumbers,
    arrNotes,
    itemID
  }
}

module.exports = {
  formatColumnValues,
  parseColumnValues,
  nameSplit,
  phoneFormat
}

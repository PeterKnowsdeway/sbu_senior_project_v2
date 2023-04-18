
const { configVariables } = require('../config/config-helper.js');

async function nameSplit(name) {
  const nameParts = name.trim().split(/\s+/); // Split on one or more whitespace characters

  // Limit the name to at most three parts
  if (nameParts.length > 3) {
    nameParts.splice(3);
  }

  // If there is no middle name, shift the last name to the middle name position
  if (nameParts.length === 2) {
    nameParts.splice(1, 0, '');
  }

  return nameParts;
}

async function formatPhoneNumber (phone) {
  // Try to format mobile and work phones
  if (phone !== undefined) {
    console.log(phone)
    if (phone.length === 10) {
      return phone = await '1 (' + phone.slice(0, 3) + ') ' + phone.substring(3, 6) + '-' + phone.substring(6, 10)
    }
  }
}

async function formatColumnValues (itemMap) {
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;

  let workPhone = await formatPhoneNumber(itemMap[workPhoneID]);
  let mobilePhone = await formatPhoneNumber(itemMap[mobilePhoneID]);
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

module.exports = {
  formatColumnValues,
  nameSplit,
  formatPhoneNumber
}
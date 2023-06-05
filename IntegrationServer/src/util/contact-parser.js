const { configVariables } = require('../config/config-helper.js');

const PhoneNumber = require('libphonenumber-js');

async function nameSplit(name) {
  const nameArr = await name.split(" ");

  if (nameArr.length !== 3) {
    nameArr[2] = nameArr.length === 2 ? nameArr[1] : "";
    nameArr[1] = "";
  }

  return nameArr;
}

/**
  Formats a phone number in a specific format.
  @async
  @function phoneFormat
  @param {string} phone - A string representing a phone number.
  @returns {Promise<string>} A formatted phone number string.
  @throws {Error} Throws an error if there is an issue formatting the phone number.
*/

async function phoneFormat(phone) {
	//Try to format mobile and work phones 
  if (typeof phone !== 'string') {
    throw new Error('Phone number must be a string.');
  }

  const phoneNumber = new PhoneNumber(phone, 'US'); // Specify the default country if necessary

  if (!phoneNumber.isValid()) {
    throw new Error('Invalid phone number. Please provide a valid phone number.');
  }

  return phoneNumber.formatInternational();
}

/**
 * Formats the column values of a given item in the board to extract specific data.
 * @async
 * @function formatColumnValues
 * @param {object} itemMap - An object representing the column values of a board item.
 * @returns {Promise<object>} An object containing arrays of emails, phone numbers, and notes.
 * @throws {Error} Throws an error if there is an issue formatting the column values.
 */

async function formatColumnValues (itemMap) {
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

/**
  Parses the column values of a given item in the board to extract specific data.
  @async
  @function parseColumnValues
  @param {object} currentItem - An object representing a board item.
  @returns {Promise<object>} An object containing arrays of emails, phone numbers, and notes, as well as the item ID.
  @throws {Error} Throws an error if there is an issue parsing the column values.
*/

async function parseColumnValues(currentItem) { 
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;

  const arrEmails = []
  const arrPhoneNumbers=[]
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
  nameSplit
}

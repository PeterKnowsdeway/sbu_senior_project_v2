const { configVariables } = require('../config/config-helper.js');

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

/**
  Formats a phone number in a specific format.
  @async
  @function phoneFormat
  @param {string} phone - A string representing a phone number.
  @returns {Promise<string>} A formatted phone number string.
  @throws {Error} Throws an error if there is an issue formatting the phone number.
  @mermaid
    graph LR;
      A((Start)) --> B{Is phone defined?}
      B -->|Yes| C{Is phone length equal to 10?}
      C -->|Yes| D(Return formatted phone number)
      C -->|No| E(Return original phone number)
      B -->|No| E(Return original phone number)
      D((Formatted Phone))
      E((Original Phone))
*/

async function phoneFormat(phone) {
	//Try to format mobile and work phones 
	if(phone != undefined) {
		if(phone.length == 10) {
			phone = await '1 ('+ phone.slice(0,3) + ') ' +  phone.substring(3,6) + '-' + phone.substring(6,10);
		}
	}
  return phone;
}

/**
 * Formats the column values of a given item in the board to extract specific data.
 * @async
 * @function formatColumnValues
 * @param {object} itemMap - An object representing the column values of a board item.
 * @returns {Promise<object>} An object containing arrays of emails, phone numbers, and notes.
 * @throws {Error} Throws an error if there is an issue formatting the column values.
 * @mermaid
    flowchart TD;
      subgraph formatColumnValues
        A((itemMap))
        B{configVariables}
        C((primaryEmail))
        D((secondaryEmail))
        E((workPhone))
        F((mobilePhone))
        G((notes))
        H((arrEmails))
        I((arrPhoneNumbers))
        J((arrNotes))   
        B -- primaryEmailID --> C
        B -- secondaryEmailID --> D
        B -- workPhoneID --> E
        B -- mobilePhoneID --> F
        B -- notesID --> G
        E -->|async| x(phoneFormat) -->|async| I
        F -->|async| x(phoneFormat) -->|async| I
        C --> H
        D --> H
        E --> I
        F --> I
        G --> J
        A --> C
        A --> D
        A --> E
        A --> F
        A --> G
        H -->|return| J
      end
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
  @mermaid
    flowchart TD;
      Start[Start] --> Process[Process]
      Process --> End[End]
      Process --> |Loop Through Columns| ColumnLoop[Loop Through Columns]
      ColumnLoop --> |Check Column ID| CheckID{Column ID}
      CheckID --> |primaryEmailID| AddWorkEmail[Add Work Email]
      CheckID --> |secondaryEmailID| AddOtherEmail[Add Other Email]
      CheckID --> |workPhoneID| AddWorkPhone[Add Work Phone]
      CheckID --> |mobilePhoneID| AddMobilePhone[Add Mobile Phone]
      CheckID --> |notesID| AddNote[Add Note]
      CheckID --> |item_id| SaveItemID[Save Item ID]
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

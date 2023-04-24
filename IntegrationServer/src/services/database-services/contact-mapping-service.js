/*
  This file contains functions that interact with the ContactMapping database.
  ContactMapping is a Sequilize database that contains two columns:
    - itemID (primary key)
    - resourceName (string)
    - etag (string)

  The ContactMapping database is used to keep track of the etag values for each contact.
  The etag value is used to determine whether or not a contact has been updated since the last time it was synced with Google Cotnacts.
  The etag value is also used to determine whether or not a contact is new to Google Contacts.
  If a contact is new to HubSpot, then the contact will be created in Google Contacts.
  If a contact has been updated since the last time it was synced with Google Contacts, then the contact will be updated in Google Contacts.
*/

const { ContactMapping } = require('../../db/models') // Imports command (which extends from sequilize's db Model?) from contactmapping.js (also see ContactMapping.init)

const logger = require('../../middleware/logging.js')

// Takes an itemID as an argument, and returns the result of a query to the database.
// Database query to find item with matching primary key
const getContactMapping = async (itemID) => {
  try {
    // findByPk is sequilize search command to find a single entry using the PrimaryKey
    return await ContactMapping.findByPk(itemID)
  } catch (err) {
    logger.error({
      message: `Error finding single entry ${itemID}`,
      function: 'getContactMapping',
      params: { itemID },
      error: err.stack
    })
    throw err
  }
}

// Creates new entry within ContactMapping sequilize database to keep track of contacts.
const createContactMapping = async (attributes) => {
  const { itemID, resourceName, etag } = attributes
  try {
    await ContactMapping.create({
      id: itemID, // PrimaryKey - this should match monday.com itemID field for each contact
      resourceName, // datatype Column - e.g. "Primary Email".
      etag // Column content - e.g. "someone@email.com"
    })
  } catch (err) {
    logger.error({
      message: `Error creating new entry ${attributes}`,
      function: 'createContactMapping',
      params: { itemID, resourceName, etag },
      error: err.stack
    })
    throw err
  }
}

// Updates an entry within ContactMapping sequilize database with new information
const updateContactMapping = async (itemID, updates) => {
  const { resourceName, etag } = updates
  try {
    return await ContactMapping.update(
      { resourceName, etag },
      {
        where: {
          id: itemID
        }
      }
    )
  } catch (err) {
    logger.error({
      message: `Error updating existing entry ${itemID}, ${updates}`,
      function: 'updateContactMapping',
      params: { itemID, updates },
      error: err.stack
    })
    throw err
  }
}

// Delete ALL data from database.
const deleteDatabse = async () => {
  try {
    await ContactMapping.destroy( // Sequilize command with options set up to delete ALL data from ContactMapping
      {
        where: {}, // Field to specify what to delete - empty for all
        truncate: true // option description from Sequilize.org: "[options.truncate=false]" "If set to true, dialects that support it will use TRUNCATE instead of DELETE FROM. If a table is truncated the where and limit options are ignored"
      }
    )
  } catch (err) {
    logger.error({
      message: 'Error destroying database',
      function: 'updateContactMapping',
      error: err.stack
    })
    throw err
  }
}

module.exports = {
  getContactMapping,
  createContactMapping,
  updateContactMapping,
  deleteDatabse
}

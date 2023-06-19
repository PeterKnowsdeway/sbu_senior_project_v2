const { ContactMapping } = require('../../db/models')

/**
 * Retrieves a contact mapping record from the database by its ID.
 * @async
 * @param {number} itemID - The ID of the contact mapping record to retrieve.
 * @returns {Promise<Object>} A Promise that resolves to the retrieved contact mapping record.
 * @throws {Error} If an error occurs while querying the database.
 */
const getContactMapping = async (itemID) => { 
  try {
    const queryResult = await ContactMapping.findByPk(itemID)
    return queryResult
  } catch (err) {
    throw new Error(`Error retrieving contact mapping records from database: ${err.message}`)
  }
}

/**
 * Creates a new contact mapping record in the database with the specified attributes.
 * @async
 * @param {Object} attributes - An object containing the attributes for the new contact mapping record.
 * @param {number} attributes.itemID - The ID of the new contact mapping record.
 * @param {string} attributes.resourceName - The resource name for the new contact mapping record.
 * @param {string} attributes.etag - The etag value for the new contact mapping record.
 * @throws {Error} If an error occurs while creating the contact mapping record in the database
 */
const createContactMapping = async (attributes) => {
	const {itemID, resourceName, etag} = attributes
	try{
		await ContactMapping.create({ id: itemID, resourceName, etag })
	}
	catch (err) {
		throw new Error(`Error creating contact mapping records in database: ${err.message}`)
	}	
}

/**
 * Updates a contact mapping record in the database with the specified attributes.
 * @async
 * @param {number} itemID - The ID of the contact mapping record to update.
 * @param {Object} updates - An object containing the updates to apply to the contact mapping record.
 * @param {string} updates.resourceName - The updated resource name for the contact mapping record.
 * @param {string} updates.etag - The updated etag value for the contact mapping record.
 * @returns {Promise<number>} A Promise that resolves to the number of updated records.
 * @throws {Error} If an error occurs while updating the contact mapping record in the database.
 */
const updateContactMapping = async (itemID, updates) => {
  const {resourceName, etag} = updates
  try {
    const updatedContactMapping = await ContactMapping.update({resourceName, etag}, { where: { id: itemID } })
    return updatedContactMapping
  } catch (err) {
    throw new Error(`Error updating contact mapping records from database: ${err.message}`)
  }
}

/**
 * Deletes all contact mapping records from the database.
 * @async
 * @throws {Error} If an error occurs while deleting the contact mapping records from the database.
 */
const deleteDatabse = async () => {
  try {
	  await ContactMapping.destroy({ where: {}, truncate: true })
  } catch (err) {
    throw new Error(`Error deleting contact mapping records from database: ${err.message}`);
  }
}

module.exports = {
	getContactMapping,
	createContactMapping,
	updateContactMapping,
	deleteDatabse
}

const { ContactMapping } = require('../../db/models'); 
const { logger } = require('../../middleware/logger.js')
const { v4: uuidv4 } = require('uuid');
const ID = uuidv4()

/**
 * Retrieves a contact mapping record from the database by its ID.
 * @async
 * @param {number} itemID - The ID of the contact mapping record to retrieve.
 * @returns {Promise<Object>} A Promise that resolves to the retrieved contact mapping record.
 * @throws {Error} If an error occurs while querying the database.
 */
const getContactMapping = async (itemID) => { 
  try {
    const queryResult = await ContactMapping.findByPk(itemID);
    return queryResult;
  } catch (err) {
    logger.error({
      requestID: ID,
      message: `Error: An error occured retrieving contact mapping: ${err}`,
      function: 'getContactMapping',
      stacktrace: err.stack
    }) 
    throw err
  }
};

/**
 * Creates a new contact mapping record in the database with the specified attributes.
 * @async
 * @param {Object} attributes - An object containing the attributes for the new contact mapping record.
 * @param {number} attributes.itemID - The ID of the new contact mapping record.
 * @param {string} attributes.resourceName - The resource name for the new contact mapping record.
 * @param {string} attributes.etag - The etag value for the new contact mapping record.
 * @throws {Error} If an error occurs while creating the contact mapping record in the database.
 */
const createContactMapping = async (attributes) => {
	const {itemID, resourceName, etag} = attributes;
	try {
		const newContactMapping = await ContactMapping.create( { 
			id: itemID, 
			resourceName,
			etag,
		});	
	}
	catch (err) {
		logger.error({
      requestID: ID,
      message: `Error: An error occured while creating a contact mapping: ${err}`,
      function: 'createContactMapping',
      stacktrace: err.stack
    })
    throw err
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
  const {resourceName, etag} = updates;
  try {
    const updatedContactMapping = await ContactMapping.update(
  		{ resourceName, etag },
    		{
    			where: {
    				id: itemID,
    			},
    		}
    );
    return updatedContactMapping;
  } catch (err) {
    logger.error({
      requestID: ID,
      message: `Error: An error occured while updating a contact mapping: ${err}`,
      function: 'updatedContactMapping',
      stacktrace: err.stack
    })
    throw err
  }
};

/**
 * Deletes all contact mapping records from the database.
 * @async
 * @throws {Error} If an error occurs while deleting the contact mapping records from the database.
 */
const deleteDatabse = async () => {
  try {
	  await ContactMapping.destroy( 
      {
        where: {}, 
		    truncate: true 
      }
    );
  } catch (err) {
     logger.error({
      requestID: ID,
      message: `Error: An error occured while deleting database: ${err}`,
      function: 'deleteDatabase',
      stacktrace: err.stack
    })
    throw err
  }
};

module.exports = {
	getContactMapping,
	createContactMapping,
	updateContactMapping,
	deleteDatabse
};
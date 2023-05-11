const { ContactMapping } = require('../../db/models'); //Imports command (which extends from sequilize's db Model?) from contactmapping.js (also see ContactMapping.init)

/**
 * Retrieves a contact mapping record from the database by its ID.
 * @async
 * @param {number} itemID - The ID of the contact mapping record to retrieve.
 * @returns {Promise<Object>} A Promise that resolves to the retrieved contact mapping record.
 * @throws {Error} If an error occurs while querying the database.
 * graph TD;
 *    A[getContactMapping] -->|itemID| B[ContactMapping];
 *    B -->|queryResult| C[queryResult];
 *    C -->|return| D[queryResult];
 *    D -.->|result| A;
 *    A -->|error| E[console.error];
 *    E -->|throw| F[throw err];
 */
const getContactMapping = async (itemID) => { //Database query to find item with matching primary key
  try {
    const queryResult = await ContactMapping.findByPk(itemID); //findByPk is sequilize search command to find a single entry using the PrimaryKey
    return queryResult;
  } catch (err) {
    console.error(err); 
    throw err;
  }
};

/**
 * Creates a new contact mapping record in the database with the specified attributes.
 * @async
 * @param {Object} attributes - An object containing the attributes for the new contact mapping record.
 * @param {number} attributes.itemID - The ID of the new contact mapping record.
 * @param {string} attributes.resourceName - The resource name for the new contact mapping record.
 * @param {string} attributes.etag - The etag value for the new contact mapping record.
 * @throws {Error} If an error occurs while creating the contact mapping record in the database
 *
 * @mermaid
 *  graph TD;
      A[createContactMapping] --> B[attributes];
      B -->|itemID| C(id);
      B -->|resourceName| D(resourceName);
      B -->|etag| E(etag);
      C -->|PrimaryKey| F(itemID);
      D -->|datatype Column| G(resourceName);
      E -->|Column content| H(etag);
      F -->|Sequelize PK search| I[ContactMapping];
      I --> J[queryResult];
      J --> A;
 */
const createContactMapping = async (attributes) => {
	const {itemID, resourceName, etag} = attributes;
	try{
		const newContactMapping = await ContactMapping.create( { 
			id: itemID, // PrimaryKey - this should match monday.com itemID field for each contact
			resourceName, // datatype Column - e.g. "Primary Email".
			etag, // Column content - e.g. "someone@email.com"
		});	
	}
	catch (err) {
		console.log(err);
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
 * 
 * @mermaid
 *  graph TD;
      A[Start] -->|itemID, updates| B((Update Contact Mapping))
      B -->|resourceName, etag| C((Update))
      C --> D[End]
 */
const updateContactMapping = async (itemID, updates) => {
  const {resourceName, etag} = updates;
  try {
    const updatedContactMapping = await ContactMapping.update(
		{resourceName, etag},
		{
			where: {
				id: itemID,
			},
		}
    );
    return updatedContactMapping;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Deletes all contact mapping records from the database.
 * @async
 * @throws {Error} If an error occurs while deleting the contact mapping records from the database.
 */
const deleteDatabse = async () => {
  try {
	  await ContactMapping.destroy( //Sequilize command with options set up to delete ALL data from ContactMapping
      {
        where: {}, // Field to specify what to delete - empty for all
		truncate: true // option description from Sequilize.org: "[options.truncate=false]" "If set to true, dialects that support it will use TRUNCATE instead of DELETE FROM. If a table is truncated the where and limit options are ignored"
      }
    );
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
	getContactMapping,
	createContactMapping,
	updateContactMapping,
	deleteDatabse
};
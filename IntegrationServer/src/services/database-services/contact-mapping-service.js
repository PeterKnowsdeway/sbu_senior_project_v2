const { ContactMapping } = require('../../db/models'); //Imports command (which extends from sequilize's db Model?) from contactmapping.js (also see ContactMapping.init)

// Takes an itemID as an argument, and returns the result of a query to the database.
const getContactMapping = async (itemID) => { //Database query to find item with matching primary key
  try {
    const queryResult = await ContactMapping.findByPk(itemID); //findByPk is sequilize search command to find a single entry using the PrimaryKey
    return queryResult;
  } catch (err) {
    console.error(err); 
    throw err;
  }
};

//Creates new entry within ContactMapping sequilize database to keep track of contacts.
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

//Updates an entry within ContactMapping sequilize database with new information
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

//Delete ALL data from database.
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
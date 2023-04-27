/* Creating a JSON object with the keys and values. */
const configVariables = {
	"workPhoneID": '',
	"mobilePhoneID": '',
	"primaryEmailID": '',
	"secondaryEmailID": '',
	"notesID": '',
	"createNewDatabase": true
}

/**
 * Takes a JSON object as a parameter, and then it loops through the object and assigns the values
 * of the object to variables.
 * @param config - A json object containing values to be set for the config variables.
 */
async function setConfigVariables (config){
	let {columnIds, settings} = config;
	
	let index = 0;
	while(index < columnIds.length)
	{
		let currentSection = columnIds[index]
		switch(currentSection.title){
			case process.env.WORK_PHONE_TITLE:
				console.log(currentSection.id);
				configVariables.workPhoneID = currentSection.id;
				break;
			case process.env.MOBILE_PHONE_TITLE:
				console.log(currentSection.id);
				configVariables.mobilePhoneID = currentSection.id;
				break;
			case process.env.EMAIL_PRIMARY_TITLE:
				console.log(currentSection.id);
				configVariables.primaryEmailID = currentSection.id;
				break;
			case process.env.EMAIL_SECONDARY_TITLE:
				console.log(currentSection.id);
				configVariables.secondaryEmailID = currentSection.id;
				break;
			case process.env.NOTES_TITLE:
				console.log(currentSection.id);
				configVariables.notesID = currentSection.id;
				break;
			}
		index++;
	}
	if(settings.createNewDatabase != undefined) {
		configVariables.createNewDatabase = settings.createNewDatabase;
	}
}

/* Exporting the variables and functions to be used in other files. */
module.exports = {
	configVariables,
	setConfigVariables
}
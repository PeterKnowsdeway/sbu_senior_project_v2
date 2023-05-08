const conf = './config.json' // CONFIG FILE REFERENCE - this file may not exist, in which case it will be created later
const fs = require('fs')

/* Import the configVariables from the config-helper.js file. */
const { configVariables } = require('../config/config-helper.js') // List of IDs for the various titles being looked at on Monday.com
const setConfigVariables = require('../config/config-helper.js').setConfigVariables

/*Database controller  */
const { deleteDatabse } = require('../services/database-services/contact-mapping-service');

/**
 * Sets up config.json when config.json does not exist. Else it reads the values in config.json
 * @param boardItems - an array of objects that contain the information for each contact.
 * @returns 0 for success, or 1 for error
 */
async function initializeConfig (boardItems) {
  try {
    let columnIdConfig = []
    const currentItem = boardItems[0] // container for the current' columns IDs (see above)
    columnIdConfig = await getColumnIdConfig(currentItem, columnIdConfig, 0) //assume: at least one item in board. otherwise button should not exist to trigger.
    //This wil get the *current* columns with matching Title name. In case a header name ever changes (e.g. deleted and remade), this needs to check every time.

    await dbCheck(); //Check: if config doesn't exist, or setting createNewDatabase == true, delete db.

    let config = { //object to be used for setting config.json (hard copy for restarts)
      columnIds: columnIdConfig,
      settings: {
        createNewDatabase: false
      }
    }

    await setConfigVariables(config) //internal set for server. temp.

    fs.writeFile(conf, JSON.stringify(config), (err) => { //make/update config.json
      if (err) { return err }
      console.log('config has been stored')
    })

    return null
  } catch (err) {
    console.error('The initial board configuration has failed: ')
    console.error(err)
    return 1 // Error has occured - TODO: handle in function call
  }
}

async function getColumnIdConfig (currentItem, columnIdConfig, boardItemIndex) {
  const validTitles = [
    process.env.WORK_PHONE_TITLE,
    process.env.MOBILE_PHONE_TITLE,
    process.env.EMAIL_PRIMARY_TITLE,
    process.env.EMAIL_SECONDARY_TITLE,
    process.env.NOTES_TITLE
  ]

  for (let i = 0; i < currentItem.column_values.length; i++) {
    const currentColumn = currentItem.column_values[i]
    const columnId = currentColumn.id

    if (boardItemIndex === 0 && validTitles.includes(currentColumn.title)) {
      const obj = {
        id: columnId,
        title: currentColumn.title
      }

      columnIdConfig.push(obj)
      console.log(currentColumn.title + ' ' + currentColumn.id)
    }
  }

  return columnIdConfig
}

async function dbCheck() {
  if (!(fs.existsSync(conf))) { //no config - assume deletion.
    await deleteDatabse()
  } else {
    let config = fs.readFileSync(conf)
    config = await JSON.parse(config)

    if(config.settings.createNewDatabase == true) {
      await deleteDatabse();
    }
  }
}

module.exports = {
  initializeConfig,
  getColumnIdConfig
}
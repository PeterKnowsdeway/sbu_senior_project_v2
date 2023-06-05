const conf = './config.json' 
const fs = require('fs')

/* Import the configVariables from the config-helper.js file. */
const { configVariables } = require('../config/config-helper.js') // List of IDs for the various titles being looked at on Monday.com
const setConfigVariables = require('../config/config-helper.js').setConfigVariables

/*Database controller  */
const { deleteDatabse } = require('../services/database-services/contact-mapping-service');

/**
  * Initializes the configuration for the board, including getting column IDs with matching title names, checking the database, and setting config variables.
  * @async
  * @function initializeConfig
  * @param {Array} boardItems - An array of board items.
  * @throws {Error} Throws an error if the initial board configuration has failed.
  * @returns {Promise<null>} Returns a promise that resolves to null when the configuration is complete.
  *
  * @mermaid
      flowchart TD;
        subgraph initializeConfig(boardItems)
            A[Initialize Config] --> B{Catch Error}
            B -- Yes --> C[Log Error and Throw Error]
            B -- No --> D[Get Column IDs]
            D --> E{Check Config}
            E -- Yes --> F[Create Config Object]
            F --> G[Set Config Variables]
            G --> H[Write to Config.json]
            H --> I[Log Success]
            I --> J[Return Null]
            E -- No --> K[Delete Database]
        end
*/
async function initializeConfig (boardItems) {
  try {
    let columnIdConfig = []
    const currentItem = boardItems[0] 
    columnIdConfig = await getColumnIdConfig(currentItem, columnIdConfig, 0) 
    await dbCheck()
    let config = { 
      columnIds: columnIdConfig,
      settings: {
        createNewDatabase: false
      }
    }

    await setConfigVariables(config)

    fs.writeFile(conf, JSON.stringify(config), (err) => { 
      if (err) { return err }
      console.log('config has been stored')
    })

    return null
  } catch (err) {
    console.error('The initial board configuration has failed: ')
    console.error(err)
    return 1 
  }
}

/**
  * Retrieves the ID and title of specific columns from an item in a board, as specified by their titles.
  * @async
  * @function
  * @param {Object} currentItem - The current item being processed in the board.
  * @param {Array<Object>} columnIdConfig - An array of objects representing the columns' IDs and titles.
  * @param {number} boardItemIndex - The index of the current item in the board.
  * @returns {Promise<Array<Object>>} - A Promise that resolves with an array of objects representing the columns' IDs and titles.
  * @mermaid
  *   graph TD;
  *     A((currentItem)) -- Iterate over column_values --> B{boardItemIndex = 0 and validTitles includes currentColumn.title?};
  *     B -- Yes --> C((obj));
  *     C -- Add obj to columnIdConfig --> D(columnIdConfig);
  *     C -- Log parsed title and ID to console --> E(Logger);
  *     B -- No --> F((End));
  *     D --> G(Return columnIdConfig);
*/

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

/**
  * Checks for the existence of a configuration file, and deletes the database if no config file is found
  * or if the configuration settings specify that a new database should be created.
  * @async
  * @function
  * @returns {Promise<void>} - A Promise that resolves with no value when the function is finished.
  * 
  * @mermaid
  *   graph TD;
  *     A[Check if configuration file exists]
  *     B[Delete database]
  *     C[Read configuration file]
  *     D[Parse configuration file]
  *     E[Create new database]
  *     F[Do nothing]
        
  *     A -- Config file does not exist --> B
  *     A -- Config file exists --> C
  *     C -- Successfully parsed --> D
  *     C -- Parsing failed --> B
  *     D -- createNewDatabase = true --> E
  *     D -- createNewDatabase = false --> F
*/

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
const conf = './config.json' // CONFIG FILE REFERENCE - this file may not exist, in which case it will be created later
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()
/* Import the configVariables from the config-helper.js file. */
const setConfigVariables = require('../config/config-helper.js').setConfigVariables
const { logger } = require('../middleware/logger.js')

/* Database controller  */
const { deleteDatabse } = require('../services/database-services/contact-mapping-service')

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
    const currentItem = boardItems[0] // container for the current' columns IDs (see above)
    columnIdConfig = await getColumnIdConfig(currentItem, columnIdConfig, 0) // assume: at least one item in board. otherwise button should not exist to trigger.
    // This wil get the *current* columns with matching Title name. In case a header name ever changes (e.g. deleted and remade), this needs to check every time.

    await dbCheck() // Check: if config doesn't exist, or setting createNewDatabase == true, delete db.

    const config = { // object to be used for setting config.json (hard copy for restarts)
      columnIds: columnIdConfig,
      settings: {
        createNewDatabase: false
      }
    }

    await setConfigVariables(config) // internal set for server. temp.

    fs.writeFile(conf, JSON.stringify(config), (err) => { // make/update config.json
      if (err) {
        logger.error({
          requestID: ID,
          message: `Error: Could not write to config.json ${err}`,
          function: 'initializeConfig',
          stacktrace: err.stack
        })
      }
      logger.info({
        requestID: ID,
        message: `Success: Config has been stored ${err}`,
        function: 'initializeConfig',
        params: { boardIems, conf }
      })
    })

    return null
  } catch (err) {
    logger.error({
        requestID: ID,
        message: `Error: The initial board configuration has failed ${err}`,
        function: 'initializeConfig',
        stacktrace: err.stack,
    })
    throw err
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
      logger.info({
        requestID: ID,
        message: `Title Parsed: ${currentColumn.title} ${currentColumn.id}`,
        function: 'getColumnIdConfig',
        params: { currentColumn, columnID, boardItemIndex }
      }
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
async function dbCheck () {
  if (!(fs.existsSync(conf))) { // no config - assume deletion.
    deleteDatabse()
  } else {
    let config = fs.readFileSync(conf)
    config = await JSON.parse(config)

    if (config.settings.createNewDatabase === true) {
      deleteDatabse()
    }
  }
}

module.exports = {
  initializeConfig,
  getColumnIdConfig
}

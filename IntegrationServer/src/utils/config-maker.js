const conf = './config.json' // CONFIG FILE REFERENCE - this file may not exist, in which case it will be created later
const fs = require('fs')

/* Import the configVariables from the config-helper.js file. */
const setConfigVariables = require('../config/config-helper.js').setConfigVariables
const logger = require('../middleware/logging.js')
const { deleteDatabse } = require('../services/database-services/contact-mapping-service');

const validTitles = [
  process.env.WORK_PHONE_TITLE,
  process.env.MOBILE_PHONE_TITLE,
  process.env.EMAIL_PRIMARY_TITLE,
  process.env.EMAIL_SECONDARY_TITLE,
  process.env.NOTES_TITLE
]

/**
 * Sets up config.json when config.json does not exist. Else it reads the values in config.json
 * @param boardItems - an array of objects that contain the information for each contact.
 * @returns 0 for success, or 1 for error
 */
async function initializeConfig (boardItems) {
  try {
    let columnIdConfig = []
    const currentItem = boardItems[0] // container for the current' columns IDs (see above)

    if (!(fs.existsSync(conf))) {
      columnIdConfig = getColumnIdConfig(currentItem, columnIdConfig, 0) // assume: at least one item in board. otherwise button should not exist to trigger
      deleteDatabse(); //No config - reset database TODO: Write a case for this to not trigger
      
      const config = {
        columnIds: columnIdConfig,
        settings: {
          createNewDatabase: false
        }
      }
      try {
        await setConfigVariables(config)
      } catch (err) {
        logger.error({
          message: `Error setting to config variables: ${err}`,
          function: 'initializeConfig',
          params: { config },
          error: err.stack
        })
      }
      fs.writeFile(conf, JSON.stringify(config), (err) => {
        if (err) {
          logger.error({
            message: `Error writing to config.json: ${err}`,
            function: 'initializeConfig',
            params: { boardItems },
            error: err.stack
          })
          return err
        }
        logger.info('config has been stored')
      })
    } else {
      let config = fs.readFileSync(conf)
      config = await JSON.parse(config)
      columnIdConfig = getColumnIdConfig(currentItem, columnIdConfig, 0)
      config.columnIds = columnIdConfig
      config.settings.createNewDatabase = false

      await setConfigVariables(config)

      fs.writeFile(conf, JSON.stringify(config), (err) => {
        if (err) {
          logger.error({
            message: `Error writing to config.json: ${err}`,
            function: 'initializeConfig',
            params: { boardItems },
            error: err.stack
          })
        }
        console.log('config has been updated')
      })
    }

    return null
  } catch (err) {
    logger.error({
      message: `The initial board configuration has failed: ${err}`,
      function: 'initializeConfig',
      params: { boardItems },
      error: err.stack
    })
    return 1 // Error has occured - TODO: handle in function call
  }
}

function getColumnIdConfig (currentItem, columnIdConfig, boardItemIndex) {
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

module.exports = {
  initializeConfig
}

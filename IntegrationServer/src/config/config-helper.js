const { logger } = require('../middleware/logger.js')
const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()
/**
 * An object containing configuration variables.
 * @typedef {Object} configVariables
 * @property {string} workPhoneID - The ID of the work phone column in Monday.com.
 * @property {string} mobilePhoneID - The ID of the mobile phone column in Monday.com.
 * @property {string} primaryEmailID - The ID of the primary email column in Monday.com.
 * @property {string} secondaryEmailID - The ID of the secondary email column in Monday.com.
 * @property {string} notesID - The ID of the notes column in Monday.com.
 * @property {boolean} createNewDatabase - Whether to create a new database.
 */
const configVariables = {
  workPhoneID: '',
  mobilePhoneID: '',
  primaryEmailID: '',
  secondaryEmailID: '',
  notesID: '',
  createNewDatabase: true
}

/**
 * Sets configuration variables based on a given JSON object.
 * @param {Object} config - The JSON object containing configuration variables.
 * @param {Object[]} config.columnIds - An array of column objects.
 * @param {Object} config.settings - An object containing additional settings.
 * @param {boolean} [config.settings.createNewDatabase=true] - Whether to create a new database.
 * @returns {Promise<configVariables>} - A Promise that resolves with the updated configVariables object.
 * @throws {TypeError} - If the config argument is not an object or if it doesn't contain the necessary properties.
 * @throws {Error} - If any errors occur during the assignments
 */

async function setConfigVariables (config) {
  const { columnIds, settings } = config

  let index = 0
  while (index < columnIds.length) {
    // Ignore object injeciton sink. Index is always a #
    const currentSection = columnIds[index]
    switch (currentSection.title) {
      case process.env.WORK_PHONE_TITLE:
        try {
          configVariables.workPhoneID = currentSection.id
        } catch (error) {
          logger.error({
            message: `Error setting workPhoneID: ${error}`,
            function: 'setConfigVariables',
            params: { configVariables, currentSection },
            stacktrace: error.stack
          })
          throw error
        }
        break
      case process.env.MOBILE_PHONE_TITLE:
        try {
          configVariables.mobilePhoneID = currentSection.id
        } catch (error) {
          logger.error({
            requestID: ID,
            message: `Error setting mobilePhoneID: ${error}`,
            function: 'setConfigVariables',
            params: { configVariables, currentSection },
            stacktrace: error.stack
          })
          throw error
        }
        break
      case process.env.EMAIL_PRIMARY_TITLE:
        try {
          configVariables.primaryEmailID = currentSection.id
        } catch (error) {
          logger.error({
            requestID: ID,
            message: `Error setting primaryEmailID: ${error}`,
            function: 'setConfigVariables',
            params: { configVariables, currentSection },
            stacktrace: error.stack
          })
          throw error
        }
        break
      case process.env.EMAIL_SECONDARY_TITLE:
        try {
          configVariables.secondaryEmailID = currentSection.id
        } catch (error) {
          logger.error({
            requestID: ID,
            message: `Error setting secondaryEmailID: ${error}`,
            function: 'setConfigVariables',
            params: { configVariables, currentSection },
            stacktrace: error.stack
          })
          throw error
        }
        break
      case process.env.NOTES_TITLE:
        try {
          configVariables.notesID = currentSection.id
        } catch (error) {
          logger.error({
            requestID: ID,
            message: `Error setting notesID: ${error}`,
            function: 'setConfigVariables',
            params: { configVariables, currentSection },
            stacktrace: error.stack
          })
          throw error
        }
        break
    }
    index++
  }
  if (settings.createNewDatabase !== undefined) {
    configVariables.createNewDatabase = settings.createNewDatabase
  }
}

module.exports = {
  configVariables,
  setConfigVariables
}

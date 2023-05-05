const fs = require('fs').promises
const { setConfigVariables } = require('./config/config-helper.js')
const { logger } = require('./middleware/logger.js')
const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()
const OAuth2Client = require('./OAuth/google-auth.js').OAuthClient

/**
  * Async function that sets OAuth credentials for an OAuth2Client instance by reading a token file and parsing it as JSON.
  * @async
  * @function
  * @returns {Promise<void>} A Promise that resolves with no value when the credentials are successfully set.
  * @throws {Error} An Error is thrown if the token file cannot be read or parsed.
  *
  * @mermaid
  *  graph TD;
  *    start[Start] --> tryCatch(Try-Catch);
  *    tryCatch --> readFile[Read token file];
  *    readFile --> parseJSON[Parse token as JSON];
  *    parseJSON --> setCredentials[Set OAuth credentials];
  *    setCredentials --> logSuccess[Log success message];
  *    logSuccess --> end[End];
  *    tryCatch --> tokenNotFound[Token not found?];
  *    tokenNotFound -- Yes --> logTokenNotFound[Log error message: token not found];
  *    logTokenNotFound --> end;
  *    tokenNotFound -- No --> tokenError[Token error?];
  *    tokenError -- Yes --> logTokenError[Log error message: could not read token];
  *    logTokenError --> end;
  *    tokenError -- No --> end;
*/
async function setOAuthCredentials () {
  try {
    const token = await fs.readFile('./token.json')
    OAuth2Client.credentials = JSON.parse(token)
    logger.info({
      requestID: ID,
      message: 'Success: token found and loaded',
      function: 'setOAuthCredentials',
      params: { token }
    })
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.error({
        requestID: ID,
        message: `Error: Token not found: ${err}`,
        function: 'setOAuthCredentials',
        stacktrace: err.stack
      })
    } else {
      logger.error({
        requestID: ID,
        message: `Error: Could not read token: ${err}`,
        function: 'setOAuthCredentials',
        stacktrace: err.stack
      })
    }
  }
}

/**
* Async function that loads configuration variables by reading a config file and parsing it as JSON.
* @async
* @function
* @returns {Promise<void>} A Promise that resolves with no value when the configuration variables are successfully loaded.
*
* @mermaid
*   graph TD;
*     start[Start] --> tryCatch(Try-Catch);
*     tryCatch --> readFile[Read config file];
*     readFile --> parseJSON[Parse config as JSON];
*     parseJSON --> setConfigVariables[Set config variables];
*     setConfigVariables --> logSuccess1[Log success message];
*     logSuccess1 --> logSuccess2[Log success message];
*     logSuccess2 --> end[End];
*     tryCatch --> configNotFound[Config not found?];
*     configNotFound -- Yes --> logConfigNotFound[Log error message: config.json not found];
*     logConfigNotFound --> end;
*     configNotFound -- No --> configError[Config error?];
*     configError -- Yes --> logConfigError[Log error message: config.json could not be loaded];
*     logConfigError --> end;
*     configError -- No --> end;
*/
async function loadConfigVariables () {
  try {
    const config = await fs.readFile('./config.json')
    logger.info({
      requestID: ID,
      message: 'Success: config found',
      function: 'loadConfigVariables',
      params: { config }
    })
    const parsedConfig = JSON.parse(config)
    await setConfigVariables(parsedConfig)
    logger.info({
      requestID: ID,
      message: 'Success: config found',
      function: 'loadConfigVariables',
      params: { parsedConfig }
    })
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.error({
        requestID: ID,
        message: `Error: config.json not found: ${err}`,
        function: 'loadConfigVariables',
        stacktrace: err.stack
      })
    } else {
      logger.error({
        requestID: ID,
        message: `Error: config.json could not be loaded: ${err}`,
        function: 'loadConfigVariables',
        stacktrace: err.stack
      })
    }
  }
}

module.exports = {
  loadConfigVariables,
  setOAuthCredentials
}

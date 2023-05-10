const {google} = require('googleapis')
const fs = require('fs').promises

const {setConfigVariables} = require('./config/config-helper.js')

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
    const token = await fs.readFile("./token.json")
    OAuth2Client.credentials = JSON.parse(token)
    console.log("OAuth Credentials Set")
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log("No token found")
    } else {
      console.error("Error reading token file: ", err)
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
    const config = await fs.readFile("./config.json")
    console.log("loading config")
    const parsedConfig = JSON.parse(config)
    await setConfigVariables(parsedConfig)
    console.log("configs loaded");
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log("No config found");
    } else {
      console.error("Error reading config file: ", err);
    }
  }
}

module.exports = {
  loadConfigVariables,
  setOAuthCredentials,
};
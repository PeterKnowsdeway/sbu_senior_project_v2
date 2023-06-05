const { promises: fs } = require('fs');
const { setConfigVariables } = require('./config/config-helper.js');
const { OAuthClient } = require('./OAuth/google-auth.js');
const logger = require('./middleware/logger.js');

const TOKEN_PATH = process.env.TOKEN_PATH || './token.json';
const CONFIG_PATH = process.env.CONFIG_PATH || './config.json';


async function handleFileReadError(errorType, filePath) {
  const errorMessage =
    errorType === 'ENOENT'
      ? `File not found: ${filePath}`
      : `Error reading file ${filePath}: ${errorType}`;
  logger.error({
    message: errorMessage
  })
}

/** 
  * Async function that sets OAuth credentials for an OAuth2Client instance by reading a token file and parsing it as JSON.
  * @async
  * @function
  * @returns {Promise<void>} A Promise that resolves with no value when the credentials are successfully set.
  * @throws {Error} An Error is thrown if the token file cannot be read or parsed.
*/
async function setOAuthCredentials() {
  try {
    const token = await fs.readFile('./token.json');
    OAuthClient.credentials = JSON.parse(token);
    logger.info({
      message: 'Token file loaded successfully',
      function: 'setOAuthCredentials',
    });
  } catch (err) {
    await handleFileReadError(err.code, TOKEN_PATH);
  }
}

/**
* Async function that loads configuration variables by reading a config file and parsing it as JSON.
* @async
* @function
* @returns {Promise<void>} A Promise that resolves with no value when the configuration variables are successfully loaded.
*/
async function loadConfigVariables() {
  try {
    const config = await fs.readFile(CONFIG_PATH);
    logger.info({
      message: 'Config file found',
      function: 'loadConfigVariables',
    });
    const parsedConfig = JSON.parse(config);
    await setConfigVariables(parsedConfig);
    logger.info({
      message: 'Config file variables loaded successfully',
      function: 'loadConfigVariables',
    });
  } catch (err) {
    await handleFileReadError(err.code, CONFIG_PATH);
  }
}

module.exports = {
  loadConfigVariables,
  setOAuthCredentials,
};

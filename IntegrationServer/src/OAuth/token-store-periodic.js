/*
  This file is used to update the access token that is used by the Google API.
  It is scheduled to run every hour, and it will send a request to the Google API
  which will update the access token.

  The access token is stored in a file called token.json, this file is created
  when the user authenticates the app with their Google account.

  The access token is stored in the token.json file, and it is also stored in
  the OAuth2Client object.

  The useAccessToken function will send a request to the Google API, which will
  update the access token in the OAuth2Client object.

  The updateToken function will check if the token.json file exists, if it does,
  it will read the file and compare it to the access token that is stored in the
  OAuth2Client object. If the access token in the OAuth2Client object is different
  than the access token in the token.json file, then the token.json file will be
  updated with the new access token.
*/

const fs = require('fs')
const { google } = require('googleapis')

const OAuth2Client = require('./google-auth.js').OAuthClient
const TOKEN_PATH = './token.json'
const logger = require('../middleware/logging.js')

google.options({ auth: OAuth2Client })

function useAccessToken () {
  // Prevent integrations from running if no credentials are set
  if (!(Object.keys(OAuth2Client.credentials).length === 0)) {
    // Send a blank request to google APi, this will update the access token, and prevent it from expiring in the event the API is
    // not used for weeks on end.
    const service = google.people({ version: 'v1', auth: OAuth2Client })
    service.people.connections.list({
      pageSize: 1,
      resourceName: 'people/me',
      personFields: 'metadata'
    }, (err, res) => {
      if (err) {
        logger.error({
          message: `The API returned an error: ${err}`,
          function: 'useAccessToken',
          error: err.stack
        })
        return
      }
      updateToken()
    })
  } else {
    logger.warn({
      message: 'No credentials set for access token update',
      function: 'useAccessToken'
    })
  }
}

// Checks if the token.json file exists, if it does, it reads the file and compares it to the
// current credentials, if they are different, it writes the new credentials to the file.
function updateToken () {
  const credentials = JSON.stringify(OAuth2Client.credentials)

  if (fs.existsSync(TOKEN_PATH)) {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        logger.error({
          message: `Error reading ./token.json: ${err}`,
          function: 'updateToken'
        })
        return
      }
      const cachedCredentials = JSON.parse(token.toString())
      if (JSON.stringify(cachedCredentials) !== credentials) {
        fs.writeFile(TOKEN_PATH, credentials, (err) => {
          if (err) {
            logger.error({
              message: `Error writing to ./token.json: ${err}`,
              function: 'updateToken'
            })
            return
          }
          logger.info({
            message: 'Cached token updated',
            function: 'updateToken'
          })
        })
      } else {
        logger.info({
          message: 'No update to cached token',
          function: 'updateToken'
        })
      }
    })
  }
  logger.info({
    message: 'Attempted to update cached token',
    function: 'updateToken'
  })
}

module.exports = {
  updateToken,
  useAccessToken
}

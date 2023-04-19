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

google.options({ auth: OAuth2Client })

function useAccessToken () {
  // Prevent integrations from running if no credentials are set
  if (!(Object.keys(OAuth2Client.credentials).length === 0)) {
    // Send a blank request to google APi, this will update the access token, and prevent it from expiring in the event the API is not used for weeks on end.
    const service = google.people({ version: 'v1', auth: OAuth2Client })
    service.people.connections.list({
      pageSize: 1,
      resourceName: 'people/me',
      personFields: 'metadata'
    }, (err, res) => {
      if (err) return console.error('The API returned an error: ' + err)
      updateToken()
    })
  } else {
    console.log('No credentials set for access token update')
  }
}

// Checks if the token.json file exists, if it does, it reads the file and compares it to the
// current credentials, if they are different, it writes the new credentials to the file.
function updateToken () {
  const credentials = JSON.stringify(OAuth2Client.credentials)

  if (fs.existsSync('./token.json')) {
    fs.readFile('./token.json', (err, token) => {
      if (err) return console.error(err)
      const cachedCredentials = JSON.parse(token.toString())
      if (JSON.stringify(cachedCredentials) !== credentials) {
        fs.writeFile('./token.json', credentials, (err) => {
          if (err) return console.error(err)
          console.log('Cached token updated')
        })
      } else {
        console.log('No updated to cached token')
      }
    })
  }
  console.log('Update Cached token attempted')
}

module.exports = {
  updateToken,
  useAccessToken
}

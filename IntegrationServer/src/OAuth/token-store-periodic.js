const schedule = require('node-schedule')
const fs = require('fs')
const { google } = require('googleapis')

const OAuth2Client = require('./google-auth.js').OAuthClient

google.options({ auth: OAuth2Client })

schedule.scheduleJob('0 * * * *', useAccessToken) // Schedules useAccessToken to run every ???

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
      const cachedCredentials = JSON.parse(token.toString());
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
  updateToken
}

// look in ouath client for credentials, if they exist, override whtat is token.json

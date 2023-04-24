const fs = require('fs').promises

const { setConfigVariables } = require('./config/config-helper.js')

const OAuth2Client = require('./OAuth/google-auth.js').OAuthClient

async function setOAuthCredentials () {
  try {
    const token = await fs.readFile('./token.json')
    OAuth2Client.credentials = JSON.parse(token)
    console.log('OAuth Credentials Set')
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No token found')
    } else {
      console.error('Error reading token file: ', err)
    }
  }
}

async function loadConfigVariables () {
  try {
    const config = await fs.readFile('./config.json')
    console.log('loading config')
    const parsedConfig = JSON.parse(config)
    await setConfigVariables(parsedConfig)
    console.log('configs loaded')
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No config found')
    } else {
      console.error('Error reading config file: ', err)
    }
  }
}

module.exports = {
  loadConfigVariables,
  setOAuthCredentials
}

const fs = require('fs')
const { google } = require('googleapis')

const TOKEN_PATH = './token.json'

const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BACK_TO_URL
)

// Declares the necessary scopes from Google
const SCOPES = ['https://www.googleapis.com/auth/contacts']

// load the existing token from the token.json file
const token = fs.readFileSync(TOKEN_PATH)

// set the credentials of the OAuth2 client to the existing token
OAuth2Client.setCredentials(JSON.parse(token))

// get a new access token and refresh token
async function getNewToken(req, res) {
  const url = OAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', url)
  const code = req.query.code 
  const { tokens } = await OAuth2Client.getToken(code)
  console.log(tokens)
  OAuth2Client.setCredentials(tokens)
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
  console.log('New access token and refresh token have been obtained and stored in token.json')
}

module.exports = {
	getNewToken
}

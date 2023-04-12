const { google } = require('googleapis')
const fs = require('fs')
const NodeCache = require('node-cache')
const myCache = new NodeCache({ stdTTL: 1000, useClones: false })

const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BACK_TO_URL)
// "232811749250-phji8o1bmnd86b3vff1uetdkp12138vi.apps.googleusercontent.com", //YOUR_CLIENT_ID
// "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", //YOUR_CLIENT_SECRET
// "http://localhost:3000/tokenHandle") //backToUrl

// Declares the necessary scopes from Google
const SCOPES = ['https://www.googleapis.com/auth/contacts']
google.options({ auth: OAuth2Client })

/**
 *
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The a redirect to URL to the Google OAuth2 page, or a redirect back to Monday.com.
 */
async function setUpOAuth (req, res) {
  if (fs.existsSync('./token.json')) {
    fs.readFile('./token.json', (err, token) => {
      if (err) {
        console.error(err)
        return
      }
      OAuth2Client.credentials = JSON.parse(token)
      const returnUrl = req.session.backToUrl
      return res.redirect(returnUrl)
    })
  } else {
    myCache.set('returnURl', req.session.backToUrl)
    const url = OAuth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      // If you only need one scope you can pass it as a string
      scope: SCOPES
    })
    return res.redirect(url)
  }
}

async function codeHandle (req, res) {
  // Creates a new token or detects if a token already exists
  const backToUrl = myCache.get('returnURl')
  if (backToUrl === undefined) { return res.status(200).send({}) } else {
    myCache.del('returnURl')
    if (!(fs.existsSync('./token.json'))) {
      const TOKEN_PATH = './token.json'
      const code = req.query.code
      console.log(code)

      OAuth2Client.getToken(code, (err, token) => {
        if (err) { return console.error('Error retrieving access token', err) }
        OAuth2Client.credentials = token
        console.log(token)
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err)
          console.log('Token stored to', TOKEN_PATH)
        })
        // Store the token to disk for later program executions
      })
      return res.redirect(backToUrl)
    } else {
      fs.readFile('./token.json', (err, token) => {
        if (err) return console.error(err)
        OAuth2Client.credentials = JSON.parse(token)
      })
      return res.redirect(backToUrl)
    }
  }
}

module.exports = {
  codeHandle,
  setUpOAuth,
  OAuthClient: OAuth2Client
}

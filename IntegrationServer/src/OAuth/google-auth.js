const { google } = require('googleapis')
const fs = require('fs')
const { asyncGet, asyncDel, asyncSet } = require('../middleware/redis.js')

const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BACK_TO_URL
)

// Declares the necessary scopes from Google
const SCOPES = ['https://www.googleapis.com/auth/contacts']

// The path to the token file
const TOKEN_PATH = './token.json'

// The key for the return URL in the cache
const RETURN_URL_KEY = 'returnURl'

google.options({ auth: OAuth2Client })

/**
 * @param req - The request object.
 * @param res - The response object.
 * @returns The a redirect to URL to the Google OAuth2 page, or a redirect back to Monday.com.
 */
async function setUpOAuth (req, res) {
  fs.promises.access(TOKEN_PATH, fs.constants.F_OK)
    .then(() => {
      fs.promises.readFile(TOKEN_PATH)
        .then(token => {
          OAuth2Client.credentials = JSON.parse(token)
          const returnUrl = req.session.backToUrl
          return res.redirect(returnUrl)
        })
        .catch(err => {
          return res.status(500).send()
        })
    })
    .catch(async () => {
      await asyncSet(RETURN_URL_KEY, req.session.backToUrl)
      try {
        const url = OAuth2Client.generateAuthUrl({
          access_type: 'offline',
          prompt: 'consent',
          scope: SCOPES
        })
        return res.redirect(url)
      } catch (err) {
        return res.status(500).send('Internal Server Error')
      }
    })
}

async function codeHandle (req, res) {
  const backToUrl = await asyncGet(RETURN_URL_KEY)
  if (backToUrl === undefined) {
    return res.status(200).send({})
  } else {
    await asyncDel(RETURN_URL_KEY)
    fs.promises.access(TOKEN_PATH, fs.constants.F_OK)
      .then(() => {
        fs.promises.readFile(TOKEN_PATH)
          .then(token => {
            OAuth2Client.credentials = JSON.parse(token)
            return res.redirect(backToUrl)
          })
          .catch(err => {
            return res.status(500).send()
          })
      })
      .catch(() => {
        const code = req.query.code
        OAuth2Client.getToken(code)
          .then(token => {
            OAuth2Client.credentials = token
            console.log("Token: ", token.tokens)
            fs.promises.writeFile(TOKEN_PATH, JSON.stringify(token.tokens))
              .then(() => {
                return res.redirect(backToUrl)
              })
              .catch(err => {
                return res.status(500).send('Internal Server Error')
              })
          })
          .catch(err => {
            return res.status(500).send()
          })
      })
  }
}

async function getNewToken(req, res) {
  console.log("Get Token")
  if(fs.existsSync(TOKEN_PATH)) {
    // load the existing token from the token.json file
    const token = fs.readFileSync(TOKEN_PATH);
    const url = OAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES
    });
    console.log(url)
    const client = await OAuth2Client.getClient();
    const res = await client.request({ url });
    console.log('Authorize this app by visiting this url:', url)
    const code = req.query.code 
    const { tokens } = await OAuth2Client.getToken(code)
    console.log(tokens)
    OAuth2Client.setCredentials(tokens)
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
    console.log('New access token and refresh token have been obtained and stored in token.json')
  }
}                     

module.exports = {
  codeHandle,
  setUpOAuth,
  OAuthClient: OAuth2Client,
  getNewToken
}
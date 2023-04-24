const { google } = require('googleapis')
const fs = require('fs')
const { asyncGet, asyncDel, asyncSet } = require('../middleware/redis.js')
const logger = require('../middleware/logging.js')

const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BACK_TO_URL)

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
          logger.error({
            message: `Error reading ${TOKEN_PATH}`,
            function: 'setUpOAuth',
            params: { TOKEN_PATH, token },
            error: err.stack
          })
          return res.status(500).send()
        })
    })
    .catch(async () => {
      await asyncSet(RETURN_URL_KEY, req.session.backToUrl)
      try {
        const url = OAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES
        })
        return res.redirect(url)
      } catch (err) {
        logger.error({
          message: 'Error setting returnURl in Redis',
          function: 'setUpOAuth',
          params: { returnURl: req.session.backToUrl },
          error: err.stack
        })
        return res.status(500).send('Internal Server Error')
      }
    })
}

async function codeHandle (req, res) {
  const backToUrl = await asyncGet(RETURN_URL_KEY)
  if (backToUrl == undefined) {
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
            logger.info({
              message: `Received code ${code}`,
              function: 'codeHandle',
              params: { backToUrl, TOKEN_PATH }
            })
            return res.status(500).send()
          })
      })
      .catch(() => {
        const code = req.query.code
        console.log(code)
        OAuth2Client.getToken(code)
          .then(token => {
            OAuth2Client.credentials = token
            logger.info(token)
            fs.promises.writeFile(TOKEN_PATH, JSON.stringify(token))
              .then(() => {
                logger.info('Token stored to', TOKEN_PATH)
                return res.redirect(backToUrl)
              })
              .catch(err => {
                logger.error({
                  message: `Error storing token to ${TOKEN_PATH}: ${err}`,
                  function: 'codeHandle',
                  params: { backToUrl, TOKEN_PATH },
                  error: err.stack
                })
                return res.status(500).send('Internal Server Error')
              })
          })
          .catch(err => {
            logger.error({
              message: `Error storing token to ${TOKEN_PATH}: ${err}`,
              function: 'codeHandle',
              params: { backToUrl, TOKEN_PATH },
              error: err.stack
            })
            return res.status(500).send()
          })
      })
  }
}

module.exports = {
  codeHandle,
  setUpOAuth,
  OAuthClient: OAuth2Client
}

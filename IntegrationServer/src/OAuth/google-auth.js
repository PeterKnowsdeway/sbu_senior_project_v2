/**
 * This file contains the code that is used to set up the OAuth2 connection with Google.
 * It is used to redirect the user to the Google OAuth2 page, and to handle the code that is returned.
 */

const { google } = require('googleapis')
const fs = require('fs')
const { asyncGet, asyncDel, asyncSet } = require('../middleware/redis.js')
const logger = require('../middleware/logging.js')

const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BACK_TO_URL
)

// Declares the necessary scopes from Google
const SCOPES = ['https://www.googleapis.com/auth/contacts']

google.options({ auth: OAuth2Client })

const TOKEN_PATH = './token.json'

/**
 *
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The a redirect to URL to the Google OAuth2 page, or a redirect back to Monday.com.
 */
async function setUpOAuth (req, res) {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        logger.error({
          message: `Error reading ${TOKEN_PATH}`,
          function: 'setUpOAuth',
          params: { TOKEN_PATH, token },
          error: err.stack
        })
        return res.status(500).send('Internal Server Error')
      }

      OAuth2Client.credentials = JSON.parse(token)
      const returnUrl = req.session.backToUrl
      return res.redirect(returnUrl)
    })
  } else {
    try {
      await asyncSet('returnURl', req.session.backToUrl)
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
  }
}

async function codeHandle (req, res) {
  const backToUrl = await asyncGet('returnURl')
  if (!backToUrl) {
    return res.status(200).send({})
  } else {
    asyncDel('returnURl')
    if (!fs.existsSync(TOKEN_PATH)) {
      const code = req.query.code
      logger.info({
        message: `Received code ${code}`,
        function: 'codeHandle',
        params: { backToUrl, TOKEN_PATH }
      })

      OAuth2Client.getToken(code, (err, token) => {
        if (err) {
          logger.error({
            message: `Error retrieving access token: ${err}`,
            function: 'codeHandle',
            params: { backToUrl, TOKEN_PATH }
          })
          return
        }
        OAuth2Client.credentials = token
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) {
            logger.error({
              message: `Error storing token to ${TOKEN_PATH}: ${err}`,
              function: 'codeHandle',
              params: { backToUrl, TOKEN_PATH },
              error: err.stack
            })
            return
          }
          logger.info({
            message: `Token stored to ${TOKEN_PATH}`,
            function: 'codeHandle',
            params: { backToUrl, TOKEN_PATH }
          })
        })
        return res.redirect(backToUrl)
      })
    } else {
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          logger.error({
            message: `Error reading ${TOKEN_PATH}: ${err}`,
            function: 'codeHandle',
            params: { backToUrl, TOKEN_PATH },
            error: err.stack
          })
          return
        }
        OAuth2Client.credentials = JSON.parse(token)
        return res.redirect(backToUrl)
      })
    }
  }
}

module.exports = {
  codeHandle,
  setUpOAuth,
  OAuthClient: OAuth2Client
}

const jswtoken = require('jsonwebtoken')
const { logger } = require('../middleware/logger.js')
const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()

/**
  Authenticates that the request sent from the Monday.com App is valid and authorized.
  It uses the JSON Web Token (JWT) library to decrypt the expected information in the request using the signing secret.
  If the authentication succeeds, it stores some data to the session and allows the request to continue.
  If it fails, the request is stopped.
  @async
  @function
  @param {Object} req - The HTTP request object.
  @param {Object} res - The HTTP response object.
  @param {function} next - The next function to be executed.
  @throws {Error} - If there is an error while authenticating the request with Monday.com or if the request is not authenticated.
*/

async function authRequestMiddleware (req, res, next) {
  try {
    let authorization = req.headers.authorization // Get the authentication info from the request.
    if (!authorization && req.query) {
      authorization = req.query.token
    }

    // At this point, we actually try and verify the request.
    // If the verifiy function fails, then we know that the request wasn't sent from our Monday app.
    const { accountId, userId, backToUrl, shortLivedToken } = jswtoken.verify(
      authorization,
      process.env.MONDAY_SIGNING_SECRET
    )

    req.session = { accountId, userId, backToUrl, shortLivedToken }
    next()
  } catch (err) {
    logger.error({
      requestID: ID,
      message: `Error: An error occcured while authenticating with Monday.com: ${err}`,
      function: 'authRequestMiddleware',
      stacktrace: err.stack
    })
    res.status(500).json({ error: 'not authenticated' })
  }
}

module.exports = {
  authRequestMiddleware
}

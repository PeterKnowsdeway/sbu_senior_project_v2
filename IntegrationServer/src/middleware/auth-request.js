/**
 * This file is used to authenticate requests that come from our Monday.com app.
 * It uses the Monday.com signing secret to decrypt the request, and then stores
 * the decrypted data to the session.
 */

const jswtoken = require('jsonwebtoken') // get the json webtoken library.
const logger = require('./logging.js')

async function authRequestMiddleware (req, res, next) {
  try {
    let authorization = req.headers.authorization // get the authentication info from the request.
    if (!authorization && req.query) {
      authorization = req.query.token
    }

    // at this point, we actually try and verify the request.
    // If the verifiy function fails, then we know that the request wasn't sent from our Monday app.
    const { accountId, userId, backToUrl, shortLivedToken } = jswtoken.verify(
      authorization,
      logger.info(process.env.MONDAY_SIGNING_SECRET)
    )

    req.session = { accountId, userId, backToUrl, shortLivedToken }
    next()
  } catch (err) {
    logger.error({
      message: `Error validating token: ${err.message}`,
      function: 'authRequestMiddleware',
      params: { req, res, next },
      error: err.stack
    })
    res.status(500).json({ error: 'not authenticated' })
  }
}

module.exports = {
  authRequestMiddleware
}

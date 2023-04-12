const jswtoken = require('jsonwebtoken') // get the json webtoken library.

// This function authenticates that the request that got sent from our Monday.com App. It uses the signing secrete and JWT to try and decript
// some expected information in the request. If it succeeds, it stores some data to the session, and allows the request through, if it fails, the request
// is stopped.
async function authRequestMiddleware (req, res, next) {
  console.log('I made it to authRequestMiddleWare.js')
  try {
    let authorization = req.headers.authorization // get the authentication info from the request.
    if (!authorization && req.query) {
      authorization = req.query.token
    }

    // at this point, we actually try and verify the request.
    // If the verifiy function fails, then we know that the request wasn't sent from our Monday app.
    const { accountId, userId, backToUrl, shortLivedToken } = jswtoken.verify(
      authorization,
      process.env.MONDAY_SIGNING_SECRET
    )

    req.session = { accountId, userId, backToUrl, shortLivedToken }
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'not authenticated' })
  }
}

module.exports = {
  authRequestMiddleware
}

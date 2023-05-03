const express = require('express')
const router = express.Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')
 

const handleAuth = require('../OAuth/google-auth.js').setUpOAuth   
const generateToken = require('../OAuth/google-auth.js').codeHandle
const AuthenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware
const { isReqJSON } = require('../util/contact-parser.js')

router.use(rateLimiterUsingThirdParty);

router.get('/auth', AuthenticationMiddleware, async (req, res) => {
  await isReqJSON(req)
  await generateToken(req, res)
})

router.get('/tokenHandle', async (req, res) => {
  await isReqJSON(req)
  await handleAuth(req, res)
})

module.exports = router;
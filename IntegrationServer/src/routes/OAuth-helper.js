
// This file is used to handle the routes for the OAuth flow.

const express = require('express')
const router = express.Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')

const handleAuth = require('../OAuth/google-auth.js').setUpOAuth
const generateToken = require('../OAuth/google-auth.js').codeHandle
const AuthenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware

router.use(rateLimiterUsingThirdParty)

// get the required functions to use.

router.get('/auth', AuthenticationMiddleware, handleAuth)
router.get('/tokenHandle', generateToken)

module.exports = router


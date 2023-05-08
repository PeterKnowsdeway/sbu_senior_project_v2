/**
  * Express router for the main index.
  * @module index.js
  * @requires express
  * @requires RateLimiter
  * @requires ContactsRouter
  * @requires OAuthRouter
*/
const router = require('express').Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')
const toContactsRoute = require('./contacts-integration')
const OAuthSetupRoute = require('./OAuth-helper')

/**
  * Use the rate limiter middleware.
*/
router.use(rateLimiterUsingThirdParty)

/**
  * Use the contacts integration router.
*/
router.use(toContactsRoute)
/**
  * Use the authentication router.
*/
router.use(OAuthSetupRoute)

module.exports = router

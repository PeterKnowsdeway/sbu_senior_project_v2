
/*
  This file is the main entry point for the express server.
  It is used to import all the routes and middleware that
  the server will use.
*/

const router = require('express').Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')

const toContactsRoute = require('./contacts-integration')
const OAuthSetupRoute = require('./OAuth-helper')

router.use(rateLimiterUsingThirdParty)

console.log('I made it to index.js routes')
// tells the router listen for requsts using the contacts-integration.js file.
router.use(toContactsRoute)
router.use(OAuthSetupRoute)

module.exports = router


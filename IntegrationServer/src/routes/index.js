//this allow use of the router, which is basically just used to make the program more modular. If we ever needed to add a new integration, this would at very least make everything look
//nice and organized. And hopefully also make resuing a this framework easier.
const router = require('express').Router(); 
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js');

const toContactsRoute = require('./contacts-integration');
const OAuthSetupRoute = require('./OAuth-helper');

router.use(rateLimiterUsingThirdParty);

//tells the router listen for requsts using the contacts-integration.js file.
router.use(toContactsRoute); 
router.use(OAuthSetupRoute);

module.exports = router;
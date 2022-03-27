const express = require('express');
const router = express.Router();
 

const auth1 = require('../OAuth/googleAuth.js').setUpOAuth;   
const auth2 = require('../OAuth/googleAuth.js').codeHanlde;
const OAuthRequestAuthenticationMiddleware = require('../middleware/auth-request').authOAuthSetUp;
const contactSend = require('../middleware/auth-request').helpME;
//get the required functions to use.


router.get('/auth', OAuthRequestAuthenticationMiddleware, auth1);
router.get('/tokenHandle', auth2);
router.get('/send', contactSend);

module.exports = router;
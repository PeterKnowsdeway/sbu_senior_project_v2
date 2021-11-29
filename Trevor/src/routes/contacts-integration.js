const express = require('express');
const router = express.Router();

//TO-DO
/*
* actually impliment the functionality 
* 	-	impliment makeContact
* 	-	impliment updateContact 
* make this list look nicer 
*/

//We may or may not want to split this file into two. I think we will probably do so, but im too lazy to make that happen yet. 

const makeContact = require('../featureControl/makeContact.js').makeNewContact;   
const updateContact = require('../featureControl/updateContact.js').updateContactInfo;
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware;
//get the required functions to use. 

//when a post request is sent to /demo/print, then first run it threw the authentication, then if that passes, move it on into the actual function. 

router.post('/create', authenticationMiddleware, makeContact);

router.post('/update', authenticationMiddleware, updateContact);


router.post('/print', authenticationMiddleware,function (req, res) {
	console.log(req.body);
  console.log('printRequest', JSON.stringify(req.body));
  return res.status(200).send({});
});

module.exports = router;
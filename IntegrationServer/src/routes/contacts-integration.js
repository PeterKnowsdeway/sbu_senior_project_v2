const express = require('express');
const router = express.Router();
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js');

const makeNewContact = require('../featureControl/make-contact.js').makeNewContact;   
const updateContact = require('../featureControl/update-contact.js').updateContactInfo;
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware;
const {fetchContacts} = require('../featureControl/sync-contacts.js');
const { isReqJSON } = require('../util/contact-parser.js')
const Mutex = require('async-mutex').Mutex;

const mutex = new Mutex();

router.use(rateLimiterUsingThirdParty);

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new contact in Google Contacts from a Monday.com item.
 *     tags: 
 *       - Contacts Integration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: The Monday.com item information.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payload:
 *                 type: object
 *                 properties:
 *                   inboundFieldValues:
 *                     type: object
 *                     properties:
 *                       itemMapping:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           notes:
 *                             type: string
 *                       itemId:
 *                         type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Internal Server Error
 */

router.post('/create', authenticationMiddleware, async (req, res) => {
  await isReqJSON(req)
  await mutex.runExclusive(async () => {
    await makeNewContact(req, res);
  });
});

router.post('/update', authenticationMiddleware, async (req, res) => {
  await isReqJSON(req)
  await mutex.runExclusive(async () => {
    await updateContact(req, res);
  });
});

router.post('/sync', authenticationMiddleware, async (req, res) => {
  await isReqJSON(req)
  await mutex.runExclusive(async () => {
    await fetchContacts(req, res);
  });
});

router.post('/print', authenticationMiddleware, async (req, res) => {
  await isReqJSON(req)
  await mutex.runExclusive(async () => {
    console.log(req.body);
    console.log('printRequest', JSON.stringify(req.body));
    return res.status(200).send({});
  });
});

module.exports = router;

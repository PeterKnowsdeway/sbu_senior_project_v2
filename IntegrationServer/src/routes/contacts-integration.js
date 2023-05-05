/**
  * Express router for the contacts integration routes.
  * @module contacts-integration.js
*/
const express = require('express')
const router = express.Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')
const makeNewContact = require('../featureControl/make-contact.js').makeNewContact
const updateContact = require('../featureControl/update-contact.js').updateContactInfo
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware
const { fetchContacts } = require('../featureControl/sync-contacts.js')
const Mutex = require('async-mutex').Mutex

const mutex = new Mutex()

router.use(rateLimiterUsingThirdParty)

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
 *       400:
 *         description: Bad request. The request body is missing or invalid.
 *       401:
 *         description: Unauthorized. The user is not authenticated or authorized to access this resource.
 *       500:
 *         description: Internal Server Error
 */

router.post('/create', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    await makeNewContact(req, res)
  })
})

/**
 * @swagger
 * /update:
 *   post:
 *     summary: Update a contact in Google Contacts from a Monday.com board item.
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
 *       400:
 *         description: Bad request. The request body is missing or invalid.
 *       401:
 *         description: Unauthorized. The user is not authenticated or authorized to access this resource.
 *       500:
 *         description: Internal Server Error
 */

router.post('/update', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    await updateContact(req, res)
  })
})

/**
 * @swagger
 * /sync:
 *   post:
 *     summary: Sync all contacts in Google Contacts from a Monday.com board.
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
 *       400:
 *         description: Bad request. The request body is missing or invalid.
 *       401:
 *         description: Unauthorized. The user is not authenticated or authorized to access this resource.
 *       500:
 *         description: Internal Server Error
 */

router.post('/sync', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    await fetchContacts(req, res)
  })
})

module.exports = router

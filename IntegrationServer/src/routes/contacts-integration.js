const express = require('express')
const router = express.Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')

const makeContact = require('../featureControl/make-contact.js').makeNewContact
const updateContact = require('../featureControl/update-contact.js').updateContactInfo
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware
const { fetchContacts } = require('../featureControl/sync-contacts.js')
const Mutex = require('async-mutex').Mutex

const mutex = new Mutex()
const logger = require('../middleware/logging.js')

router.use(rateLimiterUsingThirdParty)

router.post('/create', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    try {
      await makeContact(req, res)
    } catch (err) {
      logger.error({
        message: `Error creating contact: ${err}`,
        function: 'createContact',
        params: { reqBody: req.body },
        error: err.stack
      })
    }
  })
})

router.post('/update', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    try {
      await updateContact(req, res)
    } catch (err) {
      logger.error({
        message: `Error updating contact: ${err}`,
        function: 'updateContact',
        params: { reqBody: req.body },
        error: err.stack
      })
    }
  })
})

router.post('/sync', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    try {
      await fetchContacts(req, res)
    } catch (err) {
      logger.error({
        message: `Error fetching contacts: ${err}`,
        function: 'fetchContacts',
        error: err.stack
      })
    }
  })
})

router.post('/print', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    try {
      logger.info(req.body)
      logger.indo ('printRequest', JSON.stringify(req.body))
      return res.status(200).send({})
    } catch (err) {
      logger.error({
        message: `Error processing print request: ${err}`,
        function: 'printRequest',
        params: { reqBody: req.body },
        error: err.stack
      })
    }
  })
})

module.exports = router

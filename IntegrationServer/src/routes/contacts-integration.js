const express = require('express')
const router = express.Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')

const makeContact = require('../featureControl/make-contact.js').makeNewContact
const updateContact = require('../featureControl/update-contact.js').updateContactInfo
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware
const { fetchContacts } = require('../featureControl/sync-contacts.js')
const Mutex = require('async-mutex').Mutex

const mutex = new Mutex()

router.use(rateLimiterUsingThirdParty)

router.post('/create', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    await makeContact(req, res)
  })
})

router.post('/update', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    await updateContact(req, res)
  })
})

router.post('/sync', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    await fetchContacts(req, res)
  })
})

router.post('/print', authenticationMiddleware, async (req, res) => {
  await mutex.runExclusive(async () => {
    console.log(req.body)
    console.log('printRequest', JSON.stringify(req.body))
    return res.status(200).send({})
  })
})

module.exports = router

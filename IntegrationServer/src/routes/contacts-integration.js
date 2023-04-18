/**
 * This file contains the code for the file endpoint.
 *
 * The file endpoint is used to make, update, and sync contacts.
 * It also contains a print endpoint which is used to test the queue.
 *
 * The file endpoint uses a queue to limit the number of requests that can be made at once.
 * This is to prevent the server from being overloaded with requests.
 *
 * The queue is implemented using a FIFO queue.
 *
 * The queue has a timeout for the tasks in the queue.
 * This is to prevent tasks from blocking the queue indefinitely.
 *
 */

const express = require('express')
const router = express.Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')

const makeContact = require('../featureControl/make-contact.js').makeNewContact
const updateContact = require('../featureControl/update-contact.js').updateContactInfo
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware
const { fetchContacts } = require('../featureControl/sync-contacts.js')
const Queue = require('queue-fifo')

const queue = new Queue()

// Set a timeout for tasks in the queue to prevent them from blocking the queue indefinitely
const TIMEOUT = 50000 // 5 seconds

router.use(rateLimiterUsingThirdParty)

router.post('/create', authenticationMiddleware, async (req, res) => {
  try {
    queue.enqueue(async () => {
      try {
        await makeContact(req, res)
      } catch (err) {
        console.log(err)
      }
      if (!queue.isEmpty()) queue.dequeue()
    })
    setTimeout(() => {
      if (!queue.isEmpty()) queue.dequeue()
    }, TIMEOUT)
  } catch (err) {
    console.log(err)
  }
})

router.post('/update', authenticationMiddleware, async (req, res) => {
  try {
    queue.enqueue(async () => {
      try {
        await updateContact(req, res)
      } catch (err) {
        console.log(err)
      }
      if (!queue.isEmpty()) queue.dequeue()
    })
    setTimeout(() => {
      if (!queue.isEmpty()) queue.dequeue()
    }, TIMEOUT)
  } catch (err) {
    console.log(err)
  }
})

router.post('/sync', authenticationMiddleware, async (req, res) => {
  try {
    queue.enqueue(async () => {
      try {
        await fetchContacts(req, res)
      } catch (err) {
        console.log(err)
      }
      if (!queue.isEmpty()) queue.dequeue()
    })
    setTimeout(() => {
      if (!queue.isEmpty()) queue.dequeue()
    }, TIMEOUT)
  } catch (err) {
    console.log(err)
  }
})

router.post('/print', authenticationMiddleware, async (req, res) => {
  try {
    queue.enqueue(async () => {
      console.log('printRequest', req.body)
      res.status(200).send({})
      if (!queue.isEmpty()) queue.dequeue()
    })
    setTimeout(() => {
      if (!queue.isEmpty()) queue.dequeue()
    }, TIMEOUT)
  } catch (err) {
    console.log(err)
  }
})

module.exports = router


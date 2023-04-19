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

const express = require('express');
const router = express.Router();
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js');
const makeContact = require('../featureControl/make-contact.js').makeNewContact;
const updateContact = require('../featureControl/update-contact.js').updateContactInfo;
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware;
const { fetchContacts } = require('../featureControl/sync-contacts.js');
const Queue = require('queue-fifo');

const queue = new Queue();
const TIMEOUT = 60000; // 60 seconds

router.use(rateLimiterUsingThirdParty);

const addToQueue = async (handler) => {
  return new Promise((resolve, reject) => {
    queue.enqueue(async () => {
      try {
        await handler();
        resolve();
      } catch (err) {
        reject(err);
      }
      if (!queue.isEmpty()) queue.dequeue();
    });
  });
};

router.post('/create', authenticationMiddleware, async (req, res) => {
  try {
    await addToQueue(() => makeContact(req, res));
    res.status(200).send({});
  } catch (err) {
    console.log(err);
    res.status(500).send('Error processing request');
  }
});

router.post('/update', authenticationMiddleware, async (req, res) => {
  try {
    await addToQueue(() => updateContact(req, res));
    res.status(200).send({});
  } catch (err) {
    console.log(err);
    res.status(500).send('Error processing request');
  }
});

router.post('/sync', authenticationMiddleware, async (req, res) => {
  try {
    await addToQueue(() => fetchContacts(req, res));
    res.status(200).send({});
  } catch (err) {
    console.log(err);
    res.status(500).send('Error processing request');
  }
});

router.post('/print', authenticationMiddleware, async (req, res) => {
  try {
    console.log('printRequest', req.body);
    res.status(200).send({});
  } catch (err) {
    console.log(err);
    res.status(500).send('Error processing request');
  }
});

module.exports = router;

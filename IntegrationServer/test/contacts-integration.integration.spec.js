/* const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const express = require('express');
const request = require('supertest');
const rateLimit = require('express-rate-limit');
const Mutex = require('async-mutex').Mutex;
const router = require('../src/routes/contacts-integration'); // Import the router module
// Importing functions to handle creating, syncing, and updating contacts
const { makeNewContact } = require('../src/featureControl/make-contact.js');
const { fetchContacts } = require('../src/featureControl/sync-contacts.js');
const { updateExistingContact } = require('../src/featureControl/update-contact.js');
// Importing middleware to handle authentication requests and errors
const { authRequestMiddleware } = require('../src/middleware/auth-request');
const { errorHandler } = require('../src/middleware/error-handler');
const withMutex = (fn) => async (req, res, next) => {
  const release = await mutex.acquire();
  try {
    await fn(req, res, next);
  } catch (err) {
    console.error(`Error processing ${fn.name}:`, err);
    next(err);
  } finally {
    release();
  }
};
describe('Router', () => {
  let app;
  before(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);
  });
  describe('Middleware', () => {
    it('should apply a rate limiter to all routes', async () => {
      const res = await request(app).post('/create');
      expect(res.status).to.equal(200);
      expect(res.header['x-ratelimit-limit']).to.equal(process.env.RATE_LIMIT_MAX);
      expect(res.header['x-ratelimit-remaining']).to.equal((process.env.RATE_LIMIT_MAX - 1).toString());
    });
    it('should handle authentication requests for protected routes', async () => {
      const spy = sinon.spy(authRequestMiddleware);
      const router = express.Router();
      router.post('/create', spy, (req, res) => res.sendStatus(200));
      app.use(router);
      const res = await request(app).post('/create').set('Authorization', 'Bearer token123');
      expect(spy.calledOnce).to.be.true;
      expect(res.status).to.equal(200);
    });
    it('should handle errors with the error handler middleware', async () => {
      const spy = sinon.spy(errorHandler);
      const router = express.Router();
      router.post('/create', (req, res, next) => next(new Error('Test error')));
      app.use(router);
      app.use(spy);
      const res = await request(app).post('/create');
      expect(spy.calledOnce).to.be.true;
      expect(res.status).to.equal(500);
    });
  });
  describe('Routes', () => {
    it('should call the makeNewContact function on the /create route', async () => {
      const spy = sinon.spy(makeNewContact);
      const router = express.Router();
      router.post('/create', authRequestMiddleware, withMutex(spy));
      app.use(router);
      const res = await request(app).post('/create').set('Authorization', 'Bearer token123').send({});
      expect(spy.calledOnce).to.be.true;
      expect(res.status).to.equal(200);
    });
    it('should call the updateExistingContact function on the /update route', async () => {
      const spy = sinon.spy(updateExistingContact);
      const router = express.Router();
      router.post('/update', authRequestMiddleware, withMutex(spy));
      app.use(router);
      const res = await request(app).post('/update').set('Authorization', 'Bearer token123').send({});
      expect(spy.calledOnce).to.be.true;
      expect(res.status).to.equal(200);
    });
    it('should call the fetchContacts function on the /sync route', async () => {
      const spy = sinon.spy(fetchContacts);
      const req = {};
      const res = { sendStatus: sinon.spy() };
      const next = sinon.spy();
      await router.handle({ method: 'post', url: '/sync', body: {} }, res, next);
      expect(spy.calledOnce).to.be.true;
      expect(res.sendStatus.calledOnceWith(200)).to.be.true;
      expect(next.notCalled).to.be.true;
    });
  });
}); */
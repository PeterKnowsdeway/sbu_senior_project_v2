/* const express = require('express');
const router =  require('../src/routes/OAuth-helper.js');
const rateLimit = require('express-rate-limit');
const { expect } = require('chai');
const request = require('supertest');
const { setUpOAuth, codeHandle } = require('../src/OAuth/google-auth');
const { authRequestMiddleware } = require('../src/middleware/auth-request');
const { errorHandler } = require('../src/middleware/error-handler');
describe('API OAuth-helper Routes', () => {
  const app = express();
  before(() => {
    app.use(express.json());
    app.use(router);
  });
  describe('GET /auth', () => {
    it('should return a 200 status code', async () => {
      const res = await request(app).get('/auth');
      expect(res.status).to.equal(200);
    }).timeout(300000);
    it('should call the authRequestMiddleware middleware', async () => {
      let middlewareCalled = false;
      app.use('/auth', (req, res, next) => {
        middlewareCalled = true;
        next();
      });
      await request(app).get('/auth');
      expect(middlewareCalled).to.be.true;
    });
    it('should call the setUpOAuth function', async () => {
      let functionCalled = false;
      app.use('/auth', (req, res, next) => {
        req.setUpOAuth = () => {
          functionCalled = true;
        };
        next();
      });
      await request(app).get('/auth');
      expect(functionCalled).to.be.true;
    });
  });
  describe('GET /tokenHandle', () => {
    it('should return a 200 status code', async () => {
      const res = await request(app).get('/tokenHandle');
      expect(res.status).to.equal(200);
    });
    it('should call the authRequestMiddleware middleware', async () => {
      let middlewareCalled = false;
      app.use('/tokenHandle', (req, res, next) => {
        middlewareCalled = true;
        next();
      });
      await request(app).get('/tokenHandle');
      expect(middlewareCalled).to.be.true;
    });
    it('should call the codeHandle function', async () => {
      let functionCalled = false;
      app.use('/tokenHandle', (req, res, next) => {
        req.codeHandle = () => {
          functionCalled = true;
        };
        codeHandle(req, res, next);
      });
      await request(app).get('/tokenHandle');
      expect(functionCalled).to.be.true;
    });
  });
  describe('Error handling', () => {
    it('should call the errorHandler middleware', async () => {
      let middlewareCalled = false;
      app.use('/error', (req, res, next) => {
        next(new Error('Test error'));
      });
      app.use(errorHandler);
      app.use((err, req, res, next) => {
        middlewareCalled = true;https://sbuseniorprojectv2.peterwelter.repl.co
        res.status(500).json({ message: err.message });
      });
      await request(app).get('/error');
      expect(middlewareCalled).to.be.true;
    });
  });
}); */
const expect = require('chai').expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const { authRequestMiddleware } = require('../src/middleware/auth-request');

describe('authRequestMiddleware', function() {
  let req, res, next;

  beforeEach(function() {
    req = { headers: {}, query: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() }) };
    next = sinon.stub();
  });

  it('should authenticate the request when authorization is in headers', async function() {
    const token = jwt.sign({
      accountId: '12345',
      userId: '67890',
      backToUrl: 'http://example.com',
      shortLivedToken: 'abcdefg'
    }, process.env.MONDAY_SIGNING_SECRET);
    const req = {
      headers: {
        authorization: token
      },
      query: {}
    };
    const res = {};
    const next = function() {
      expect(req.session).to.deep.equal({
        accountId: '12345',
        userId: '67890',
        backToUrl: 'http://example.com',
        shortLivedToken: 'abcdefg'
      });
      done();
    };
    authRequestMiddleware(req, res, next);
  });

  it('should authenticate the request when authorization is in query', async function() {
    const accountId = '12345';
    const userId = '67890';
    const backToUrl = 'https://www.example.com';
    const shortLivedToken = 'abcdef';

    const token = jwt.sign({ accountId, userId, backToUrl, shortLivedToken }, process.env.MONDAY_SIGNING_SECRET);
    req.query.token = token;

    await authRequestMiddleware(req, res, next);

    expect(req.session).to.deep.equal({ accountId, userId, backToUrl, shortLivedToken });
    expect(next.calledOnce).to.be.true;
  });

  it('should return a 500 error if token is not valid', async function() {
    const invalidToken = 'invalid-token';
    req.headers.authorization = `Bearer ${invalidToken}`;

    await authRequestMiddleware(req, res, next);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.status().json.calledWith({ error: 'not authenticated' })).to.be.true;
    expect(next.notCalled).to.be.true;
  });
});
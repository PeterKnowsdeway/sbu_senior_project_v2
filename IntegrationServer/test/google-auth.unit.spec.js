const assert = require('chai').assert
const fs = require('fs')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const google = require('googleapis');
const OAuth2Client = require('google-auth-library').OAuth2Client
const googleAuth = require('../src/OAuth/google-auth.js')
const chaiSinon = require('sinon-chai')
const redis = require('redis');
const client = redis.createClient();
const proxyquire = require('proxyquire');
chai.use(chaiSinon)

const { setUpOAuth } = require('../src/OAuth/google-auth.js')
const { codeHandle } = require('../src/OAuth/google-auth.js')
const { asyncGet } = require('../src/middleware/redis');

// Integration Tests?
describe('OAuth2Client', function () {
  describe('#generateAuthUrl()', function () {
    it('should redirect to the generated URL with valid parameters', function () {
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
	      process.env.GOOGLE_CLIENT_SECRET,
	      process.env.BACK_TO_URL
      )

      const res = {
        redirect: function (url) {
          assert.match(url, /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?access_type=offline&scope=.+$/)
          return this
        },
        status: function (code) {
          assert.fail(`Response status code ${code} should not have been called`)
          return this
        },
        send: function () {
          assert.fail('Response send should not have been called')
          return this
        }
      }

      try {
        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: googleAuth.SCOPES
        })
        res.redirect(url)
      } catch (err) {
        assert.fail(`An error occurred while generating the authentication URL: ${err}`)
      }
    })

    it('should return a 500 error if the URL cannot be generated', function () {
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
	      process.env.GOOGLE_CLIENT_SECRET,
	      process.env.BACK_TO_URL
      )
      const res = {
        redirect: function (url) {
          assert.fail(`Response redirect should not have been called with URL ${url}`)
          return this
        },
        status: function (code) {
          assert.equal(code, 500)
          return this
        },
        send: function () {
          assert.ok(true)
          return this
        }
      }

      try {
        oauth2Client.generateAuthUrl()
      } catch (err) {
        assert.equal(err.message, 'Invalid parameters')
        res.status(500).send()
      }
    })
  })
})

// UNIT TESTS
describe('setUpOAuth', () => {
  let req;
  let res;
  let asyncGetStub;
  let redirectStub;
  let generateAuthUrlStub;

  beforeEach(() => {
    req = {
      session: {
        backToUrl: 'http://localhost:3000/auth'
      }
    };
    res = {
      redirect: sinon.stub(),
      send: sinon.stub(),
    };
    asyncGetStub = sinon.stub(asyncGet, 'bind');
    generateAuthUrlStub = sinon.stub(OAuth2Client.prototype, 'generateAuthUrl');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect to returnUrl if token exists', async () => {
    const credentials = { access_token: '1234' };
    const token = JSON.stringify(credentials);
    asyncGetStub.withArgs('./token.json').resolves(token);
    await setUpOAuth(req, res);
    sinon.assert.calledOnce(res.redirect);
    sinon.assert.calledWith(res.redirect, 'http://localhost:3000/auth');
  });

  it('should redirect to Google OAuth2 page if token does not exist', async () => {
    asyncGetStub.withArgs('./token.json').rejects(new Error('Token not found'));
    generateAuthUrlStub.returns('http://google.com/auth');
    await setUpOAuth(req, res);
    sinon.assert.calledOnce(generateAuthUrlStub);
    sinon.assert.calledWith(generateAuthUrlStub, {
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/contacts'],
      redirect_uri: 'http://localhost:3000/tokenHandle',
    });
    sinon.assert.calledOnce(res.redirect);
    sinon.assert.calledWith(res.redirect, 'http://google.com/auth');
  });

  it('should return 500 status if URL cannot be generated', async () => {
    asyncGetStub.withArgs('./token.json').rejects(new Error('Token not found'));
    generateAuthUrlStub.throws(new Error('Unable to generate URL'));
    const statusStub = sinon.stub(res, 'status').returns(res);
    const sendStub = sinon.stub(res, 'send').returns(res);
    await setUpOAuth(req, res);
    sinon.assert.calledOnce(statusStub);
    sinon.assert.calledWith(statusStub, 500);
    sinon.assert.calledOnce(sendStub);
    sinon.assert.calledWith(sendStub, 'Unable to generate URL');
  });
});
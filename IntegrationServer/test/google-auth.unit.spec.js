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
/* describe('Google OAuth', () => {
  describe('setUpOAuth', () => {
    let req, res, generateAuthUrlStub, readFileStub, accessStub, setStub;

    beforeEach(() => {
      req = {
        session: {
          backToUrl: 'http://example.com'
        }
      };

      res = {
        redirect: sinon.stub(),
        status: sinon.stub().returns({
          send: sinon.stub()
        })
      };

      const oauth = new OAuth2Client();
      generateAuthUrlStub = sinon.stub(oauth, 'generateAuthUrl');;
      readFileStub = sinon.stub(fs.promises, 'readFile');
      accessStub = sinon.stub(fs.promises, 'access');
      setStub = sinon.stub(client, 'set');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should redirect to the return URL when the token file exists', async () => {
      accessStub.resolves();
      readFileStub.resolves('{"access_token": "access_token", "refresh_token": "refresh_token", "scope": "https://www.googleapis.com/auth/contacts", "token_type": "Bearer", "expiry_date": 1649999349001}');

      await setUpOAuth(req, res);

      sinon.assert.calledOnce(accessStub);
      sinon.assert.calledOnce(readFileStub);
      sinon.assert.notCalled(generateAuthUrlStub);
      sinon.assert.calledOnce(res.redirect);
      sinon.assert.calledWith(res.redirect, 'http://example.com');
    });


    it('should redirect to the Google OAuth page when the token file does not exist', async () => {
      accessStub.rejects();
      generateAuthUrlStub.returns('https://accounts.google.com');

      await setUpOAuth(req, res);

      sinon.assert.calledOnce(accessStub);
      sinon.assert.calledOnce(generateAuthUrlStub);
      sinon.assert.calledOnce(setStub);
      sinon.assert.calledOnce(res.redirect);
      sinon.assert.calledWith(res.redirect, 'https://accounts.google.com');
    });

    it('should handle errors when the token file cannot be read', async () => {
      accessStub.resolves();
      readFileStub.rejects();

      await setUpOAuth(req, res);

      sinon.assert.calledOnce(accessStub);
      sinon.assert.calledOnce(readFileStub);
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 500);
    });

    it('should handle errors when the return URL cannot be saved to Redis', async () => {
      accessStub.rejects();
      generateAuthUrlStub.returns('https://accounts.google.com');
      setStub.callsArgWith(2, new Error());

      await setUpOAuth(req, res);

      sinon.assert.calledOnce(accessStub);
      sinon.assert.calledOnce(generateAuthUrlStub);
      sinon.assert.calledOnce(setStub);
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 500);
    });
  });
}); */
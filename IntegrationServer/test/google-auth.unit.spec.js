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
/* describe('setUpOAuth', () => {
  let req;
  let res;
  let asyncGetStub;
  let redirectStub;
  let generateAuthUrlStub;
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcontacts&response_type=code&client_id=.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fsbuseniorprojectv2.tumekie1999.repl.co%2FtokenHandle';
   const SCOPES = ['https://www.googleapis.com/auth/contacts']

  beforeEach(() => {
    req = {
      session: {
        backToUrl: url
      }
    };
    res = {
      redirect: sinon.stub(),
      send: sinon.stub(),
      status: sinon.stub().returns(res)
    };
    asyncGetStub = sinon.stub(asyncGet, 'bind');
    generateAuthUrlStub = sinon.stub(OAuth2Client.prototype, 'generateAuthUrl');
    sinon.stub(fs, 'existsSync').returns(false)
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
    sinon.assert.calledWith(res.redirect, url);
  });

   it('should redirect to authorization URL if token does not exist', async () => {
    await setUpOAuth(req, res)
    assert.ok(res.redirect.calledOnceWith(url))
    assert.ok(fs.existsSync.calledOnceWith('./token.json'))
    assert.ok(OAuth2Client.prototype.generateAuthUrl.calledOnceWith({
      access_type: 'offline',
      scope: SCOPES
    }))
  })
}); */

/* describe('codeHandle', () => {
  let req;
  let res;
  let OAuth2Client;
  let asyncGet;
  let asyncDel;
  let codeHandle;

  beforeEach(() => {
    req = {
      query: {},
    };

    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
      redirect: sinon.stub().returnsThis(),
    };

    OAuth2Client = {
      getToken: sinon.stub(),
      credentials: null,
    };

    asyncGet = sinon.stub().resolves(null);
    asyncDel = sinon.stub().resolves(null);
    codeHandle = proxyquire('../src/OAuth/google-auth', {
      'googleapis': {
        auth: {
          OAuth2: sinon.stub().returns(OAuth2Client),
        },
        options: sinon.stub(),
      },
      '../../src/middleware/redis.js': {
        asyncGet,
        asyncDel,
      },
    });
  });

  it('should return 200 status and empty response if backToUrl is not found', async () => {
    await codeHandle(req, res);
    expect(asyncGet.calledOnceWithExactly('returnURl')).to.be.true;
    expect(res.status.calledOnceWithExactly(200)).to.be.true;
    expect(res.send.calledOnceWithExactly({})).to.be.true;
    expect(asyncDel.calledOnceWithExactly('returnURl')).to.be.true;
    expect(res.redirect.notCalled).to.be.true;
  });

  it('should redirect to backToUrl if token file exists', async () => {
    const token = { access_token: 'ACCESS_TOKEN', refresh_token: 'REFRESH_TOKEN' };
    asyncGet.resolves('http://localhost:3000');

    fs.existsSync.returns(true);
    fs.readFile.callsFake((path, callback) => {
      callback(null, JSON.stringify(token));
    });

    await codeHandle(req, res);

    expect(OAuth2Client.credentials).to.deep.equal(token);
    expect(asyncGet.calledOnceWithExactly('returnURl')).to.be.true;
    expect(asyncDel.calledOnceWithExactly('returnURl')).to.be.true;
    expect(res.redirect.calledOnceWithExactly('http://localhost:3000')).to.be.true;
  });
  it('should exchange code for token and redirect to backToUrl if token file does not exist', async () => {
    asyncGet.resolves('http://localhost:3000');

    fs.existsSync.returns(false);

    OAuth2Client.getToken.callsFake((code, callback) => {
      callback(null, { access_token: 'ACCESS_TOKEN', refresh_token: 'REFRESH_TOKEN' });
    });

    fs.writeFile.callsFake((path, data, callback) => {
      callback();
    });

    await codeHandle({ query: { code: 'CODE' } }, res);

    expect(OAuth2Client.getToken.calledOnceWithExactly('CODE', sinon.match.func)).to.be.true;
    expect(OAuth2Client.credentials).to.deep.equal({ access_token: 'ACCESS_TOKEN', refresh_token: 'REFRESH_TOKEN' });
    expect(asyncGet.calledOnceWithExactly('returnURl')).to.be.true;
    expect(asyncDel.calledOnceWithExactly('returnURl')).to.be.true;
    expect(fs.writeFile.calledOnceWithExactly('./token.json', JSON.stringify({ access_token: 'ACCESS_TOKEN', refresh_token: 'REFRESH_TOKEN' }), sinon.match.func)).to.be.true;
    expect(res.redirect.calledOnceWithExactly('http://localhost:3000')).to.be.true;
    // Ensure that res.status is not called if backToUrl exists
    expect(res.status.called).to.be.false;
  })
}); */
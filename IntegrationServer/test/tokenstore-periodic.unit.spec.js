const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const sinon = require('sinon');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library')

const { updateToken, useAccessToken } = require('../src/OAuth/token-store-periodic.js');

describe('updateToken', () => {
  let fsExistsSyncStub;
  let fsReadFileStub;
  let fsWriteFileStub;

  beforeEach(() => {
    fsExistsSyncStub = sinon.stub(fs, 'existsSync');
    fsReadFileStub = sinon.stub(fs, 'readFile');
    fsWriteFileStub = sinon.stub(fs, 'writeFile');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update cached token if credentials have changed', (done) => {
    const token = JSON.stringify({ access_token: '123', refresh_token: 'abc' });
    const cachedToken = JSON.stringify({ access_token: '456', refresh_token: 'def' });
    fsExistsSyncStub.returns(true);
    fsReadFileStub.yields(null, Buffer.from(cachedToken));
    fsWriteFileStub.yields(null);

    const OAuth2Client = {
      credentials: { access_token: '123', refresh_token: 'abc' }
    };
    updateToken(OAuth2Client);

    setTimeout(() => {
      expect(fsWriteFileStub.calledOnce).to.be.true;
      done();
    }, 10);
  });

  it('should not update cached token if credentials have not changed', (done) => {
    const token = JSON.stringify({ access_token: '123', refresh_token: 'abc' });
    const cachedToken = JSON.stringify({ access_token: '123', refresh_token: 'abc' });
    fsExistsSyncStub.returns(true);
    fsReadFileStub.yields(null, Buffer.from(cachedToken));
    fsWriteFileStub.yields(null);

    const OAuth2Client = {
      credentials: { access_token: '123', refresh_token: 'abc' }
    };
    updateToken(OAuth2Client);
    
    setTimeout(() => {
      expect(fsWriteFileStub.calledOnce).to.be.true;
      done();
    }, 10);
  });

  it('should not attempt to update cached token if token.json file does not exist', (done) => {
    fsExistsSyncStub.returns(false);

    const OAuth2Client = {
      credentials: { access_token: '123', refresh_token: 'abc' }
    };
    updateToken(OAuth2Client);

    setTimeout(() => {
      expect(fsReadFileStub.called).to.be.false;
      expect(fsWriteFileStub.called).to.be.false;
      done();
    }, 10);
  });
});

describe('useAccessToken', () => {
  let googleMock;

  beforeEach(() => {
    googleMock = {
      people: sinon.stub().returns({
        connections: {
          list: sinon.stub()
        }
      })
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update token when OAuth2Client credentials are set', (done) => {
    // Set up OAuth2Client with mock credentials
    const mockCredentials = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expiry_date: 1234567890,
      token_type: 'Bearer'
    }
    const OAuth2ClientInstance = new OAuth2Client('mock_client_id', 'mock_client_secret', 'mock_redirect_uri')
    OAuth2ClientInstance.credentials = mockCredentials
    // Set up mock Google API service
    const mockService = {
      people: {
        connections: {
          list: (options, callback) => {
            callback(null, {})
          }
        }
      }
    }
    sinon.stub(google, 'people').returns(mockService)

    // Call the function and check if token was updated
    useAccessToken()
    expect(OAuth2ClientInstance.credentials.access_token).to.equal('mock_access_token')

    // Restore mocks and finish test
    google.people.restore()
    done()
  });
});
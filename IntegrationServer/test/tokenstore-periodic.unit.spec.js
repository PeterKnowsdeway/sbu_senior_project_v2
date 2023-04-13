const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const sinon = require('sinon');
const { google } = require('googleapis');

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
    fsExistsSyncStub.returns(true);
    fsReadFileStub.yields(null, Buffer.from(token));
    fsWriteFileStub.yields(null);

    const OAuth2Client = {
      credentials: { access_token: '123', refresh_token: 'abc' }
    };
    updateToken(OAuth2Client);

    setTimeout(() => {
      expect(fsWriteFileStub.called).to.be.false;
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

/* describe('useAccessToken', () => {
  let googleServiceStub;
  let updateTokenStub;

  beforeEach(() => {
    googleServiceStub = {
      people: sinon.stub().returns({
        connections: {
          list: sinon.stub().yields(null, {})
        }
      })
    };
    updateTokenStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update access token if credentials are set', () => {
    const OAuth2Client = {
      credentials: { access_token: '123', refresh_token: 'abc' }
    };
    sinon.stub(OAuth2Client, 'people').returns(googleServiceStub);

    useAccessToken(OAuth2Client, updateTokenStub);

    expect(googleServiceStub.people.calledOnce).to.be.true;
    expect(updateTokenStub.calledOnce).to.be.true;
  });

  it('should not update access token if credentials are not set', () => {
    const OAuth2Client = { credentials: {} };

    useAccessToken(OAuth2Client, updateTokenStub);

    expect(googleServiceStub.people.called).to.be.false;
    expect(updateTokenStub.called).to.be.false;
  });
}); */
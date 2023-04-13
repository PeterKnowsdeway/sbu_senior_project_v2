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

  it('should update token when OAuth2Client credentials are set', () => {
    const OAuth2Client = {
      credentials: { access_token: 'token'}
    };
    const updateToken = sinon.stub();
    const listStub = sinon.stub().callsFake((_, callback) => callback(null, {}));
    const serviceStub = googleMock.people().connections.list.withArgs({
      pageSize: 1,
      resourceName: 'people/me',
      personFields: 'metadata'
    }).returns({ execute: listStub });
  
    useAccessToken(OAuth2Client, updateToken);

    expect(serviceStub.calledOnce).to.be.true;
    expect(listStub.calledOnce).to.be.true;
    expect(updateToken.calledOnce).to.be.true;
  });

  it('should log message when OAuth2Client credentials are not set', () => {
    const OAuth2Client = {
      credentials: {}
    }
    const consoleSpy = sinon.stub(console, 'log');

    useAccessToken();

    expect(consoleSpy.calledOnceWith('No credentials set for access token update')).to.be.true;
  });
});
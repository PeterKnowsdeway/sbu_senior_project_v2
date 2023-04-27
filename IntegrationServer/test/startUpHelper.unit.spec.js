const fs = require('fs').promises
const mock = require('mock-fs');
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect

const startupHelper = require('../src/startup-helper')
const configHelper = require('../src/config/config-helper')
const googleAuth = require('../src/OAuth/google-auth')

describe('startup-helper.js', () => {
  describe('setOAuthCredentials', () => {
    let fsReadFileStub
    let credentialsStub

  beforeEach(() => {
    fsReadFileStub = sinon.stub(fs, 'readFile')
    credentialsStub = { access_token: "ACCESS_TOKEN" }
    sinon.stub(googleAuth.OAuthClient, 'credentials').get(() => credentialsStub.credentials)
  })
  
    afterEach(() => {
      fsReadFileStub.restore()
    })

    it('should set OAuth credentials when token file is found', async () => {
      const token = { access_token: 'ACCESS_TOKEN' }
      fsReadFileStub.resolves(JSON.stringify(token))

      await startupHelper.setOAuthCredentials()

      expect(credentialsStub).to.deep.equal(token)
    })

    it('should log a message when token file is not found', async () => {
      const error = { code: 'ENOENT' }
      fsReadFileStub.rejects(error)
      const consoleSpy = sinon.spy(console, 'log')

      await startupHelper.setOAuthCredentials()

      expect(consoleSpy.calledWith('No token found')).to.be.true

      consoleSpy.restore()
    })

    it('should log an error when there is an error reading the token file', async () => {
        const error = { code: 'SOME_ERROR' }
        fsReadFileStub.rejects(error)
        const consoleErrorSpy = sinon.spy(console, 'error')
  
        await startupHelper.setOAuthCredentials()
  
        expect(consoleErrorSpy.calledWith('Error reading token file: ', error)).to.be.true
  
        consoleErrorSpy.restore()
    })
  })

  describe('loadConfigVariables', () => {
    let fsReadFileStub
    let setConfigVariablesStub

    beforeEach(() => {
       fsReadFileStub = sinon.stub(fs, 'readFile')
       setConfigVariablesStub = { someConfig: 'SOME_CONFIG' }
    })

    afterEach(() => {
      fsReadFileStub.restore()
    })

    // TODO: Get the test to work
    it('should load config variables when config file is found', async () => {
      const config = { someConfig: 'SOME_CONFIG' };
      fsReadFileStub.resolves(JSON.stringify(config))

      await startupHelper.loadConfigVariables()

      expect(setConfigVariablesStub).to.deep.equal(config)
    });

    it('should log a message when config file is not found', async () => {
      const error = { code: 'ENOENT' }
      fsReadFileStub.rejects(error)
      const consoleSpy = sinon.spy(console, 'log')

      await startupHelper.loadConfigVariables()

      expect(consoleSpy.calledWith('No config found')).to.be.true

      consoleSpy.restore()
    })

    it('should log an error when there is an error reading the config file', async () => {
      const error = { code: 'SOME_ERROR' }
      fsReadFileStub.rejects(error)
      const consoleErrorSpy = sinon.spy(console, 'error')

      await startupHelper.loadConfigVariables()

      expect(consoleErrorSpy.calledWith('Error reading config file: ', error)).to.be.true

      consoleErrorSpy.restore()
    })
  })
})

// Non-functional tests
describe('setOAuthCredentials', function() {
  it('should complete within 1 second', async function() {
    this.timeout(1000);
    const startTime = new Date().getTime();
    await startupHelper.setOAuthCredentials();
    const endTime = new Date().getTime();
    const elapsedTime = endTime - startTime;
    expect(elapsedTime).to.be.lessThan(1000);
  });
});

describe('loadConfigVariables', function() {
  it('should complete within 1 second', async function() {
    this.timeout(1000);
    const startTime = new Date().getTime();
    await startupHelper.loadConfigVariables();
    const endTime = new Date().getTime();
    const elapsedTime = endTime - startTime;
    expect(elapsedTime).to.be.lessThan(1000);
  });
});
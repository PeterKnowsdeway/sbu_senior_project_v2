const { expect } = require('chai')
const sinon = require('sinon')
const fs = require('fs')
const { initializeConfig } = require('../src/util/config-maker')

describe('initializeConfig', () => {
  let boardItems = [
  {
    column_values: [
      {
        id: '1234',
        title: process.env.WORK_PHONE_TITLE
      },
      {
        id: '5678',
        title: process.env.MOBILE_PHONE_TITLE
      },
      {
        id: '91011',
        title: process.env.EMAIL_PRIMARY_TITLE
      },
      {
        id: '121314',
        title: process.env.EMAIL_SECONDARY_TITLE
      },
      {
        id: '151617',
        title: process.env.NOTES_TITLE
      },
      {
        id: '181920',
        title: 'other column'
      },
      {
        settings: {
          createNewDatabase: true
        }
      },
    ],
  }
];

  let existsSyncStub
  let readFileSyncStub
  let writeFileStub
  let setConfigVariablesStub

  beforeEach(() => {
    existsSyncStub = sinon.stub(fs, 'existsSync').returns(false)
    readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify({}))
    writeFileStub = sinon.stub(fs, 'writeFile').callsArg(2)
    setConfigVariablesStub = sinon.stub(require('../src/config/config-helper.js'), 'setConfigVariables')
  })

  afterEach(() => {
    existsSyncStub.restore()
    readFileSyncStub.restore()
    writeFileStub.restore()
    setConfigVariablesStub.restore()
  })

  it('should create config file when it does not exist', async () => {
    await initializeConfig(boardItems)

    expect(existsSyncStub.calledOnceWith('./config.json')).to.be.true;
    expect(writeFileStub.calledOnceWith('./config.json')).to.be.true;
    expect(setConfigVariablesStub.calledOnce).to.be.true;
    expect(setConfigVariablesStub.getCall(0).args[0].createNewDatabase).to.be.true; // Add this line
  })

  it('should update config file when it already exists', async () => {
    existsSyncStub.returns(true)

    await initializeConfig(boardItems)

    expect(existsSyncStub.calledOnceWith('./config.json')).to.be.true
    expect(writeFileStub.calledOnceWith('./config.json', sinon.match.any, sinon.match.any)).to.be.true
    expect(setConfigVariablesStub.calledOnceWith(sinon.match.any, sinon.match.any, sinon.match.any, sinon.match.any, sinon.match.any)).to.be.true
  })

  it('should return an error code when an error occurs', async () => {
    writeFileStub.callsArgWith(2, new Error())

    const result = await initializeConfig(boardItems)

    expect(result).to.equal(1)
  })
}) 
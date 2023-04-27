const fs = require('fs')
const assert = require('chai').assert
const sinon = require('sinon')
const proxyquire = require('proxyquire')

describe("initializeConfig", () => {
  let fsWriteFileStub, dbCheckStub, setConfigVariablesStub;

  beforeEach(() => {
    fsWriteFileStub = sinon.stub(fs, "writeFile").callsArg(1);
    dbCheckStub = sinon.stub().resolves();
    setConfigVariablesStub = sinon.stub().resolves();
  })

  afterEach(() => {
    sinon.restore()
  })

  it("it should call the getColumnIdConfig with the first board item", async () => {
    const boardItems = [{id: 1, title: "Work Phone"}, {id: 2, title: "Mobile Phone"}, {id: 3, title: "Notes"}];
    const getColumnIdConfigStub = sinon.stub().returns([])
    const initializeConfig = proxyquire('../../src/util/config-maker/initializeConfig', {'../../src/util/config-maker/getColumnIdConfig': getColumnIdConfigStub})
    await initializeConfig(boardItems)
    sinon.assert.calledOnce(getColumnIdConfigStub)
    sinon.assert.calledWithExactly(getColumnIdConfigStub, boardItems[0], [], 0)
  })
})

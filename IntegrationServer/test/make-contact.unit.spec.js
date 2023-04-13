const { expect } = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const { makeNewContact } = require('../src/featureControl/make-contact.js')

describe('makeNewContact', () => {
  it('should call res.status and res.send once with status 200 when itemMapping is not null', async () => {
    const req = {
      body: {
        payload: {
          inboundFieldValues: {
            itemMapping: {},
            itemId: 1
          }
        }
      }
    }
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    }
    const contactMappingService = {
      getContactMapping: sinon.stub().returns({})
    }
    await makeNewContact(req, res, contactMappingService)
    expect(res.status.calledOnceWith(200)).to.be.true
    expect(res.send.calledOnce).to.be.true
  })

  it('should call makeContact and res.status and res.send once with status 200 when itemMapping is null', async () => {
    const req = {
      body: {
        payload: {
          inboundFieldValues: {
            itemMapping: {},
            itemId: 1
          }
        }
      }
    }
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    }
    const contactMappingService = {
      getContactMapping: sinon.stub().returns(null)
    }
    const makeContactStub = sinon.stub().resolves()
    const { makeNewContact } = proxyquire('../src/featureControl/make-contact.js', {
      './make-contact.js': {
        makeContact: makeContactStub
      }
    })
    await makeNewContact(req, res, contactMappingService)
    expect(makeContactStub.calledOnceWith('1', {})).to.be.true
    expect(res.status.calledOnceWith(200)).to.be.true
    expect(res.send.calledOnce).to.be.true
  })

  it('should call res.status and res.send once with status 500 when an error occurs', async () => {
    const req = {
      body: {
        payload: {
          inboundFieldValues: {
            itemMapping: {},
            itemId: 1
          }
        }
      }
    }
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    }
    const contactMappingService = {
      getContactMapping: sinon.stub().throws(new Error())
    }
    await makeNewContact(req, res, contactMappingService)
    console.log(res.status);
    expect(res.status.calledOnceWith(500)).to.be.true
    expect(res.send.calledOnce).to.be.true
  })
})

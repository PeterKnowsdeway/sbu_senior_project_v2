const { expect } = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
// Import the module that contains the function you want to test
const makeContactController = require('../src/featureControl/make-contact')

describe('makeContactController', () => {
  it('should create a new contact if no mapping exists', async () => {
    // Define test data
    const req = {
      body: {
        payload: {
          inboundFieldValues: {
            itemMapping: {
              name: 'John Doe',
              email: 'testuser@example.com',
              phone: '1234567890'
            },
            itemId: 123
          }
        }
      }
    }
    const contactMappingServiceStub = {
      getContactMapping: sinon.stub().returns(null)
    }
    const formatPhoneNumberStub = sinon.stub().returns('123-456-7890')
    const nameSplitStub = sinon.stub().returns(['John', 'Doe'])
    const createContactServiceStub = sinon.stub()
    // Override modules with stubs
    const stubs = {
      '../../src/services/database-services/contact-mapping-service': contactMappingServiceStub,
      '../../src/utils/formatPhoneNumber.js': {
        formatPhoneNumber: formatPhoneNumberStub
      },
      '../../src/utils/nameSplit.js': {
        nameSplit: nameSplitStub
      },
      '../../src/services/google-services/create-service': {
        createContactService: createContactServiceStub
      }
    }
    const makeContactController = proxyquire('../src/featureControl/make-contact', stubs)
    // Create mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub().returns()
    }
    // Call controller function
    await makeContactController.makeNewContact(req, res)
    console.log(res);
    // Assert
    expect(contactMappingServiceStub.getContactMapping.calledOnceWithExactly('123')).to.be.true
    expect(nameSplitStub.calledOnceWithExactly('John Doe')).to.be.true
    expect(formatPhoneNumberStub.calledOnceWithExactly('1234567890')).to.be.true
    expect(createContactServiceStub.calledOnceWithExactly('John Doe', ['John', 'Doe'], 'testuser@example.com', undefined, '123-456-7890', undefined, undefined, undefined, undefined)).to.be.true
    expect(res.status.calledOnceWithExactly(200)).to.be.true
    expect(res.send.calledOnce).to.be.true
  })
})
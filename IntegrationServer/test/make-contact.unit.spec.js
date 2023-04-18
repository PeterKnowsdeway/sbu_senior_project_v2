const { expect } = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
// Import the module that contains the function you want to test
const makeContactController = require('../src/featureControl/make-contact')

/* TODO: 

Testing the error handling in the makeNewContact() function to ensure that any errors are handled appropriately and a 500 response is returned.

Testing the response values for the makeNewContact() function to ensure that a 200 response is returned when a mapping already exists for the given itemID.

*/

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
    const formatPhoneNumberStub = sinon.stub().callsFake(async (phone) => {
      return '1 (' + phone.slice(0, 3) + ') ' + phone.slice(3, 6) + '-' + phone.slice(6, 10)
    })
    const nameSplitStub = sinon.stub().returns(['John', 'Doe'])
    // Define a callback function stub
    const callbackStub = sinon.stub()
    
    const createContactServiceStub = sinon.stub().callsFake(async (name, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes, callback) => {
      console.log('callback function called with arguments:', name, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes, callback);
      const res = { data: { resourceName: 'resourceName', etag: 'etag' } } // define a dummy response
      await callback(null, res) // call the callback function to execute contactMappingService.createContactMapping
      callbackStub(res) // call the callback function stub
    })

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
    // Spy on the service stubs
    const makeContactController = proxyquire('../src/featureControl/make-contact', stubs)
    // Create mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub().returns()
    }
    // Call controller function
    await formatPhoneNumberStub('1234567890')
    await createContactServiceStub('John Doe', ['John', 'Doe'], 'testuser@example.com', undefined, '123-456-7890', undefined, undefined, undefined, undefined, callbackStub);
    await makeContactController.makeNewContact(req, res)
   
    // Assert
    expect(contactMappingServiceStub.getContactMapping.calledOnceWithExactly('123')).to.be.true
    expect(nameSplitStub.calledOnceWithExactly('John Doe')).to.be.true
    expect(await formatPhoneNumberStub.getCall(0).args[0]).to.equal('1234567890');
    console.log(createContactServiceStub.args)
    expect(await createContactServiceStub.calledOnceWithExactly('John Doe', ['John', 'Doe'], 'testuser@example.com', undefined, '123-456-7890', undefined, undefined, undefined, undefined)).to.be.true
    expect(res.status.calledOnceWithExactly(200)).to.be.true
    expect(res.send.calledOnce).to.be.true
  })
})


const { expect } = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const { makeNewContact } = require('../src/featureControl/make-contact.js')
const contactMappingService = require('../src/services/database-services/contact-mapping-service');

/* describe('makeNewContact', () => {
  const req = {
    body: {
      payload: {
        inboundFieldValues: {
          itemMapping: {
            name: 'John Doe',
            primaryEmailID: 'john.doe@example.com',
            workPhoneID: '1234567890',
          },
          itemId: 123,
        },
      },
    },
  };

  const res = {
    status: sinon.stub().returns({
      send: sinon.stub(),
    }),
  };

  beforeEach(() => {
    sinon.stub(contactMappingService, 'getContactMapping');
    sinon.stub(contactMappingService, 'createContactMapping');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new contact if itemMapping does not exist', async () => {
    contactMappingService.getContactMapping.resolves(null);
    sinon.stub(module.exports, 'makeContact').resolves(0);

    await makeNewContact(req, res);

    expect(contactMappingService.getContactMapping.calledOnce).to.be.true;
    expect(module.exports.makeContact.calledOnce).to.be.true;
    expect(res.status.calledOnceWithExactly(200)).to.be.true;
  });

  it('should return 200 if itemMapping exists', async () => {
    contactMappingService.getContactMapping.resolves({});

    await makeNewContact(req, res);

    expect(contactMappingService.getContactMapping.calledOnce).to.be.true;
    expect(module.exports.makeContact.called).to.be.false;
    expect(res.status.calledOnceWithExactly(200)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    contactMappingService.getContactMapping.rejects(new Error());

    await makeNewContact(req, res);

    expect(contactMappingService.getContactMapping.calledOnce).to.be.true;
    expect(module.exports.makeContact.called).to.be.false;
    expect(res.status.calledOnceWithExactly(500)).to.be.true;
  });
}); */

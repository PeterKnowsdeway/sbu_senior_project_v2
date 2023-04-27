/* const { expect } = require('chai');
const sinon = require('sinon');
const { updateContactInfo } = require('../src/featureControl/update-contact');

describe('updateContactInfo function', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        payload: {
          inboundFieldValues: {
            itemMapping: {},
            columnId: '',
            itemId: ''
          }
        }
      }
    };
    res = {
      status: sinon.spy(),
      send: sinon.spy()
    };
  });

  it('should return a 200 status code and an empty response when a non-contact field is changed', async () => {
    req.body.payload.inboundFieldValues.columnId = 'not-a-contact-field';
    await updateContactInfo(req, res);
    expect(res.status.calledOnceWithExactly(200)).to.be.true;
    expect(res.send.calledOnceWithExactly({})).to.be.true;
  });

  it('should call the updateExisting function and return a 200 status code and an empty response when a contact field is changed', async () => {
    req.body.payload.inboundFieldValues.columnId = 'primaryEmailID';
    const updateExistingStub = sinon.stub().resolves();
    const formatColumnValuesStub = sinon.stub().resolves({ arrEmails: [], arrPhoneNumbers: [], arrNotes: [] });
    const nameSplitStub = sinon.stub().resolves([]);
    const updateContactServiceStub = sinon.stub().resolves();
    sinon.stub(global, 'setTimeout').callsFake((cb) => cb());
    sinon.stub(global, 'clearTimeout');
    sinon.stub(global, 'setImmediate').callsFake((cb) => cb());
    sinon.stub(global, 'clearImmediate');
    sinon.stub(console, 'log');
    sinon.stub(process, 'on').callsFake((event, cb) => cb());
    sinon.replaceGetter(configVariables, 'primaryEmailID', () => 'primaryEmailID');
    sinon.replaceGetter(configVariables, 'secondaryEmailID', () => 'secondaryEmailID');
    sinon.replaceGetter(configVariables, 'workPhoneID', () => 'workPhoneID');
    sinon.replaceGetter(configVariables, 'mobilePhoneID', () => 'mobilePhoneID');
    sinon.replaceGetter(configVariables, 'notesID', () => 'notesID');
    sinon.replace(google, 'options', sinon.fake());
    sinon.replace(OAuth2Client, 'getAccessToken', sinon.fake.resolves());
    sinon.replace(OAuth2Client, 'setCredentials', sinon.fake());
    sinon.replace(require('../services/google-services/update-service'), 'updateContactService', updateContactServiceStub);
    sinon.replace(require('../utils/contact-parser'), 'formatColumnValues', formatColumnValuesStub);
    sinon.replace(require('../utils/contact-parser'), 'nameSplit', nameSplitStub);
    sinon.replace(updateContactService, 'updateExisting', updateExistingStub);
    await updateContactInfo(req, res);
    expect(updateExistingStub.calledOnceWithExactly('', {})).to.be.true;
    expect(res.status.calledOnceWithExactly(200)).to.be.true;
    expect(res.send.calledOnceWithExactly({})).to.be.true;
    sinon.restore();
  });

  it('should return a 409 status code and an empty response when an error is thrown during the update process', async () => {
    req.body.payload.inboundFieldValues.columnId = 'primaryEmailID';
    const updateExistingStub = sinon.stub().rejects(new Error('some error'));
    sinon.stub(console, 'log');
    sinon.stub(global, 'setTimeout').callsFake((cb) => cb());
    const res = {
      status: sinon.spy(),
      send: sinon.spy()
    };
    
    await updateContactInfo(req, res);
    
    expect(updateExistingStub.calledOnceWithExactly(JSON.stringify(req.body.payload.inboundFieldValues.itemId), req.body.payload.inboundFieldValues.itemMapping)).to.be.true;
    expect(console.log.calledOnceWithExactly('Error in update existing contact: Error: some error')).to.be.true;
    expect(res.status.calledOnceWithExactly(409)).to.be.true;
    expect(res.send.calledOnceWithExactly({})).to.be.true;
    
    updateExistingStub.restore();
    console.log.restore();
    global.setTimeout.restore();
  });
}); */






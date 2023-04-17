const { expect } = require('chai')
const sinon = require('sinon')
const { google } = require('googleapis')
const OAuth2Client = require('../src/OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })


const { createContactService } = require('../src/services/google-services/create-service')
const contactMappingService = require('../src/services/database-services/contact-mapping-service')

describe('createContactService', () => {
  let peopleStub
  let contactMappingStub

  beforeEach(() => {
    peopleStub = sinon.stub(service.people, 'createContact')
    contactMappingStub = sinon.stub(contactMappingService, 'createContactMapping')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should create a contact with the given information', async () => {
    const name = 'John Smith'
    const nameArr = ['John', '', 'Smith']
    const primaryEmail = 'john.smith@example.com'
    const secondaryEmail = 'john.smith.personal@example.com'
    const workPhone = '123-456-7890'
    const mobilePhone = '987-654-3210'
    const notes = 'Some notes'

    const expectedRequestBody = {
      names: [
        {
          displayName: name,
          familyName: nameArr[2],
          givenName: nameArr[0],
          middleName: nameArr[1],
        },
      ],
      emailAddresses: [
        {
          value: primaryEmail,
          type: 'work',
          formattedType: 'Work',
        },
        {
          value: secondaryEmail,
          type: 'other',
          formattedType: 'Other',
        },
      ],
      phoneNumbers: [
        {
          value: workPhone,
          type: 'work',
          formattedType: 'Work',
        },
        {
          value: mobilePhone,
          type: 'mobile',
          formattedType: 'Mobile',
        },
      ],
      biographies: [
        {
          value: notes,
          contentType: 'TEXT_PLAIN',
        },
      ],
    }

    const expectedResourceName = 'people/c1234567890'
    const expectedEtag = 'etag123'

    peopleStub.callsFake((_, callback) => {
      const response = {
        data: {
          resourceName: expectedResourceName,
          etag: expectedEtag,
        },
      }
      callback(null, response)
    })

    await createContactService(name, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes)

    expect(peopleStub.calledOnce).to.be.true
    expect(peopleStub.firstCall.args[0].requestBody).to.deep.equal(expectedRequestBody)
    

    expect(contactMappingStub.calledOnce).to.be.true
    expect(contactMappingStub.firstCall.args[0]).to.deep.equal({
      itemID: undefined,
      resourceName: expectedResourceName,
      etag: expectedEtag,
    })
  })
  it('should handle errors when creating a contact', async () => {
    const name = 'John Smith';
    const nameArr = ['John', '', 'Smith'];
    const primaryEmail = 'john.smith@example.com';

    peopleStub.callsFake((_, callback) => {
      const error = new Error('Failed to create contact');
      callback(error, null);
    });

    await createContactService(name, nameArr, primaryEmail);

    // Verify that the people service was called with the correct arguments
    expect(peopleStub.calledOnce).to.be.true;
    expect(peopleStub.firstCall.args[0].requestBody.names[0].displayName).to.equal(name);

    // Verify that the contact mapping service was not called
    expect(createContactMappingStub.called).to.be.false;
  });
})
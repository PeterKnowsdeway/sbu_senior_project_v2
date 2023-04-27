const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const {
  formatColumnValues,
  parseColumnValues,
  phoneFormat
} = require('../src/utils/contact-parser.js');

const contactMappingService = require('../src/services/database-services/contact-mapping-service')

const { configVariables } = require('../src/config/config-helper.js')

describe('formatColumnValues', () => {
  let itemMap;

  beforeEach(() => {
    itemMap = {
      [configVariables.primaryEmailID]: 'test@example.com',
      [configVariables.secondaryEmailID]: 'test2@example.com',
      [configVariables.workPhoneID]: '1234567890',
      [configVariables.mobilePhoneID]: '0987654321',
      [configVariables.notesID]: 'Some notes',
    };
  });

  it('should format column values correctly', async () => {

    const result = await formatColumnValues(itemMap, configVariables);

    expect(result).to.deep.equal({
      arrEmails: [
        { value: 'test@example.com', type: 'work', formattedType: 'Work' },
        { value: 'test2@example.com', type: 'other', formattedType: 'Other' },
      ],
      arrPhoneNumbers: [
        { value: '1 (123) 456-7890', type: 'work', formattedType: 'Work' },
        { value: '1 (098) 765-4321', type: 'mobile', formattedType: 'Mobile' },
      ],
      arrNotes: [{ value: 'Some notes', contentType: 'TEXT_PLAIN' }],
    });

  });
});

describe('parseColumnValues', () => {
  let currentItemMock;

  beforeEach(() => {
      let currentItemMock = [
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
  });

  it('should parse column values correctly', async () => {
    const expectedResult = {
      arrEmails: [
        { value: 'john.doe@example.com', type: 'work', formattedType: 'Work' },
        { value: 'jane.doe@example.com', type: 'other', formattedType: 'Other' }
      ],
      arrPhoneNumbers: [
        { value: '1 (123) 456-7890', type: 'work', formattedType: 'Work' },
        { value: '1 (098) 765-4321', type: 'mobile', formattedType: 'Mobile' }
      ],
      arrNotes: [
        { value: 'Some notes', contentType: 'TEXT_PLAIN' }
      ],
      itemID: 1
    }

    const result = await parseColumnValues(currentItemMock, configVariables)
    expect(result).to.deep.equal(expectedResult)
  })

  it('should not add email or phone numbers if column value does not exist', async () => {
    const emptyCurrentItem = {
      column_values: []
    }

    const expectedResult = {
      arrEmails: [],
      arrPhoneNumbers: [],
      arrNotes: [],
      itemID: null
    }

    const result = await parseColumnValues(emptyCurrentItem, configVariables)
    expect(result).to.deep.equal(expectedResult)
  })
})




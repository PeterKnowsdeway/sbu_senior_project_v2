const fs = require('fs');
const { expect } = require('chai');
const { configVariables, setConfigVariables } = require('../src/config/config-helper.js');

describe('setConfigVariables', () => {
  it('should set the configVariables object with the correct values', async () => {
    const config = {
      columnIds: [
        { title: process.env.WORK_PHONE_TITLE, id: 'work-phone-id-123' },
        { title: process.env.MOBILE_PHONE_TITLE, id: 'mobile-phone-id-123' },
        { title: process.env.EMAIL_PRIMARY_TITLE, id: 'primary-email-id-123' },
        { title: process.env.EMAIL_SECONDARY_TITLE, id: 'secondary-email-id-123' },
        { title: process.env.NOTES_TITLE, id: 'notes-id-123' }
      ],
      settings: {
        createNewDatabase: true
      }
    };

    await setConfigVariables(config);

    expect(configVariables.workPhoneID).to.equal('work-phone-id-123');
    expect(configVariables.mobilePhoneID).to.equal('mobile-phone-id-123');
    expect(configVariables.primaryEmailID).to.equal('primary-email-id-123');
    expect(configVariables.secondaryEmailID).to.equal('secondary-email-id-123');
    expect(configVariables.notesID).to.equal('notes-id-123');
    expect(configVariables.createNewDatabase).to.be.true;
  });

  it('should not update the createNewDatabase flag if it is not provided in the settings', async () => {
    const config = {
      columnIds: [],
      settings: {}
    };

    await setConfigVariables(config);

    expect(configVariables.createNewDatabase).to.be.true;
  });
});
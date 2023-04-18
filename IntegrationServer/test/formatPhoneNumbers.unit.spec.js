const chai = require('chai');
const expect = chai.expect;
const { formatPhoneNumber }  = require('../src/utils/contact-parser.js');

describe('formatPhoneNumber', () => {
  it('should return undefined if input is undefined', async () => {
    const result = await formatPhoneNumber(undefined);
    expect(result).to.be.undefined;
  });

  it('should format a 10-digit phone number correctly', async () => {
    const input = '1234567890';
    const expectedOutput = '1 (123) 456-7890';
    const result = await formatPhoneNumber(input);
    expect(result).to.equal(expectedOutput);
  });

  it('should not format a phone number with less than 10 digits', async () => {
    const input = '123456789';
    const result = await formatPhoneNumber(input);
    expect(result).to.be.undefined;
  });

  it('should not format a phone number with more than 10 digits', async () => {
    const input = '12345678901';
    const result = await formatPhoneNumber(input);
    expect(result).to.be.undefined;
  });

  it('should not format a phone number that is not a string', async () => {
    const input = 1234567890;
    const result = await formatPhoneNumber(input);
    expect(result).to.be.undefined;
  });
});
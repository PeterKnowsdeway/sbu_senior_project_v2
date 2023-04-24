const chai = require('chai');
const expect = chai.expect;


const initMondayClient = require('monday-sdk-js');
const { getBoardItems } = require('../src/services/monday-service.js');
const aToken = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI0ODkzNzY4MCwidWlkIjo0MDQ3OTk2OCwiaWFkIjoiMjAyMy0wNC0wNFQxNjoyMjozNC41MTRaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTU3MDM1MDUsInJnbiI6InVzZTEifQ.jFbkOcYiwH-s5bXi74Kv5gegodP9l00rFvXbGGzSKwU";

describe('getBoardItems', function() {
  it('should return an array of items for a valid board ID', async function() {
    const token = aToken;
    const boardId = 4086905881; // a valid board ID

    const items = await getBoardItems(token, boardId);

    expect(items).to.be.an('array');
    expect(items.length).to.be.above(0);
    expect(items[0]).to.have.property('name');
    expect(items[0]).to.have.property('updated_at');
    expect(items[0]).to.have.property('column_values');
  });

  it('should throw an error for an invalid board ID', async function() {
    const token = aToken;
    const boardId = 0123456789; // an invalid board ID

    try {
      await getBoardItems(token, boardId);
    } catch (err) {
      expect(err).to.exist;
    }
  });
});
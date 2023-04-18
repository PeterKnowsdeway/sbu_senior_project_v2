const chai = require('chai')
const assert = chai.assert
const { nameSplit }  = require('../src/utils/contact-parser.js');

describe('nameSplit', function () {
  it('should split a name into an array with three elements', async function () {
    const result = await nameSplit('John Doe')
    assert.isArray(result)
    assert.lengthOf(result, 3)
    assert.equal(result[0], 'John')
    assert.equal(result[1], '')
    assert.equal(result[2], 'Doe')
  })

  it('should split a name with a middle name into an array with three elements', async function () {
    const result = await nameSplit('John Michael Doe')
    assert.isArray(result)
    assert.lengthOf(result, 3)
    assert.equal(result[0], 'John')
    assert.equal(result[1], 'Michael')
    assert.equal(result[2], 'Doe')
  })

  it('should split a name with multiple spaces into an array with three elements', async function () {
    const result = await nameSplit('John Michael    Doe')
    assert.isArray(result)
    assert.lengthOf(result, 3)
    assert.equal(result[0], 'John')
    assert.equal(result[1], 'Michael')
    assert.equal(result[2], 'Doe')
  })
})
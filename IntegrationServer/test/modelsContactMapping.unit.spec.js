'use strict'
const chai = require('chai')
const expect = chai.expect
const {
  sequelize,
  ContactMapping
} = require('../src/db/models') // Assuming your models are in the models folder, adjust as needed

describe('ContactMapping model', () => {
  before(async () => {
    await sequelize.sync({ force: true }) // Drops all tables and re-creates them before running tests
  })

  afterEach(async () => {
    await ContactMapping.destroy({ where: {} }) // Deletes all rows after each test
  })

  after(async () => {
    await sequelize.close() // Closes the database connection after all tests are done
  })

  it('should create a new ContactMapping', async () => {
    const mapping = await ContactMapping.create({
      resourceName: 'test',
      etag: '12345'
    })

    expect(mapping.resourceName).to.equal('test')
    expect(mapping.etag).to.equal('12345')
  })

  it('should fail to create a new ContactMapping with missing required fields', async () => {
    try {
      const mapping = await ContactMapping.create({
        etag: '12345'
      })
    } catch (err) {
      expect(err).to.be.an('error')
      expect(err.message).to.equal('notNull Violation: ContactMapping.resourceName cannot be null')
    }
  })
})
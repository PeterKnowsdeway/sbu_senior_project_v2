const { expect } = require('chai')
const config = require('../src/db/config/db.config.json')

describe('database configuration', () => {
  it('should have a development environment configuration', () => {
    expect(config.development).to.exist
    expect(config.development.dialect).to.equal('sqlite')
    expect(config.development.storage).to.equal('./database.sqlite3')
  })

  it('should have a test environment configuration', () => {
    expect(config.test).to.exist
    expect(config.test.dialect).to.equal('sqlite')
    expect(config.test.storage).to.equal(':memory')
  })

  it('should have a production environment configuration', () => {
    expect(config.production).to.exist
    expect(config.production.dialect).to.equal('sqlite')
    expect(config.production.storage).to.equal('./database.sqlite3')
  })
})
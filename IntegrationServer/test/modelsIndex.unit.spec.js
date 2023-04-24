const assert = require('chai').assert
const db = require('../src/db/models/index')
const Sequelize = require('sequelize')
const fs = require('fs')

describe('models/index', () => {
  describe('sequelize', () => {
    it('should be an instance of Sequelize', () => {
      assert.instanceOf(db.sequelize, Sequelize)
    })
  })

  describe('models', () => {
    it('should contain all the expected models', () => {
      assert.property(db, 'sequelize')
      assert.property(db, 'Sequelize')
    })
  })
})
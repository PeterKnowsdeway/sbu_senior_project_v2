/**

A Sequelize migration for creating the ContactMappings table in the database.
@typedef {Object} Migration
@property {Function} up - The function that creates the ContactMappings table in the database.
@property {Function} down - The function that drops the ContactMappings table from the database.
*/
/**

Creates the ContactMappings table in the database.
@async
@param {Object} queryInterface - The Sequelize queryInterface object.
@param {Object} Sequelize - The Sequelize object.
@returns {void}
*/
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ContactMappings', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      resourceName: {
        type: Sequelize.STRING,
		unique: true
      },
      etag: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  /**
    Drops the ContactMappings table from the database.
    @async
    @param {Object} queryInterface - The Sequelize queryInterface object.
    @param {Object} Sequelize - The Sequelize object.
    @returns {void}
  */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ContactMappings');
  }
};
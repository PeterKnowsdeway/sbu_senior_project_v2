/**

A Sequelize model representing the ContactMapping table in the database.
@typedef {Object} ContactMapping
@property {string} resourceName - The name of the resource for this contact mapping.
@property {string} etag - The etag for this contact mapping.
*/
/**

Creates a Sequelize model class representing the ContactMapping table in the database.
@param {Object} sequelize - The Sequelize instance representing the connection to the database.
@param {Object} DataTypes - The data types provided by Sequelize to use for defining fields.
@returns {ContactMapping} A Sequelize model class representing the ContactMapping table in the database.
*/

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  /**  
    A Sequelize model representing the ContactMapping table in the database.
    @class
    @extends Model
  */
  class ContactMapping extends Model {
    /*
      Helper method for defining associations.
      This method is not a part of Sequelize lifecycle.
      The models/index file will call this method automatically.
      @static
      @param {Object} models - An object containing all of the models defined in the Sequelize instance.
      @returns {void}
    */
    static associate(models) {
      // define association here
    }
  }
  ContactMapping.init({ 
    /**
      * The fields for the ContactMapping table in the database.
      *
      * @type {Object}
      * @property {string} resourceName - The name of the resource for this contact mapping.
      * @property {string} etag - The etag for this contact mapping.
    */
    resourceName: DataTypes.STRING, //itemID field not needed in Model. id field is automattically added, and we'll be using that.
    etag: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ContactMapping',
  });
  return ContactMapping;
};
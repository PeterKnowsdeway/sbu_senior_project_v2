'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ContactMapping extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  ContactMapping.init({ // Initialize ContactMapping to define database fields - see above.
    resourceName: DataTypes.STRING, // itemID field not needed in Model. id field is automattically added, and we'll be using that.
    etag: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ContactMapping'
  })
  return ContactMapping
}

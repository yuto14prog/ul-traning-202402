'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.belongsTo([モデルの型], {
      //   foreignKey: [外部キーとして扱われるカラム],
      //   as: [メソッド作成に利用される名前]
      // });
      this.Category = this.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category',
      });
    }
    isExample() {
      return this.email.endsWith('@example.com');
    }
  }
  Contact.init({
    // name: DataTypes.STRING,
    // email: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [0, 20],
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isEmail: true,
        len: [0, 100],
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true,
      }
    }
  }, {
    sequelize,
    modelName: 'Contact',
  });
  return Contact;
};
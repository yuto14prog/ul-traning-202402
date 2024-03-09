'use strict';
const {
  Model, Op
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
    static async latest(limit = 3) {
      return await Contact.findAll({
        order: [['id', 'DESC']], limit
      });
    }
    static async getNow() {
      return new Date();
    }
    static async search({ name, email, sinceDaysAgo }) {
      const where = {};
      if (name) {
        where.name = { [Op.substring]: name };
      }
      if (email) {
        where.email = { [Op.substring]: email };
      }
      if (sinceDaysAgo) {
        const since = this.getNow();
        since.setDate(since.getDate() - sinceDaysAgo);
        where.createdAt = { [Op.gte]: since };
      }
      return await Contact.findAll({
        order: [['id', 'DESC']],
        where,
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
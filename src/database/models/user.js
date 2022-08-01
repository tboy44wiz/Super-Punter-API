'use strict';

import { v4 as uuidV4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Likes, {
        as: "likes",
        foreignKey: "userId",
        onDelete: "CASCADE"
      });
      User.hasMany(models.Views, {
        as: "views",
        foreignKey: "userId",
        onDelete: "CASCADE"
      });
    }
  }
  User.init({
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM('Admin', 'Audience', 'Punter'),
    picture: DataTypes.STRING,
    pictureId: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN,
    status: DataTypes.ENUM('Active', 'Inactive'),
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'Users',
    freezeTableName: true
  });

  //  Before the Records will be created, let's do the following.
  User.beforeCreate((user) => {
    user.id = uuidV4();
  });
  User.beforeCreate((user) => {
    user.password = bcrypt.hashSync(user.password, 10);
  });
  User.beforeUpdate((user) => {
    user.password = bcrypt.hashSync(user.password, 10);
  });

  //  After the record is persisted and before the persisted data are returned, let's remove the "password".
  User.afterCreate((user) => {
    delete user.dataValues.password;
    delete user.dataValues.pictureId;
  });

  return User;
};
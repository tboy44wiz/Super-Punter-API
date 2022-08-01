'use strict';

import { v4 as uuidV4 } from 'uuid';
import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  class OTP extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OTP.init({
    userEmail: DataTypes.STRING,
    otp: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'OTP',
    tableName: 'OTP',
    freezeTableName: true
  });

  //  Before the Records will be created, let's do the following.
  OTP.beforeCreate(async (otp) => {
    otp.id = await uuidV4();
  });

  return OTP;
};
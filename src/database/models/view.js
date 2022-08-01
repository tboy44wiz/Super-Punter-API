'use strict';

import { v4 as uuidV4 } from 'uuid';
import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  class View extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      View.belongsTo(models.Podcasts, {
        as: "podcast",
        foreignKey: "podcastId",
        onDelete: "CASCADE"
      });
      View.belongsTo(models.Users, {
        as: "user",
        foreignKey: "userId",
        onDelete: "CASCADE"
      });
    }
  }
  View.init({
    podcastId: DataTypes.UUID,
    userId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Views',
    tableName: 'Views',
    freezeTableName: true
  });


  //  Before the Records will be created, let's do the following.
  View.beforeCreate((view) => {
    view.id = uuidV4();
  });

  return View;
};
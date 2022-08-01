'use strict';

import { v4 as uuidV4 } from 'uuid';
import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  class Podcast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Podcast.hasMany(models.Likes, {
        as: "likes",
        foreignKey: "podcastId",
        onDelete: "CASCADE"
      });
      Podcast.hasMany(models.Views, {
        as: "views",
        foreignKey: "podcastId",
        onDelete: "CASCADE"
      });
    }
  }
  Podcast.init({
    title: DataTypes.STRING,
    contestantA: DataTypes.STRING,
    contestantB: DataTypes.STRING,
    sportsName: DataTypes.STRING,
    leagueName: DataTypes.STRING,
    leagueAbbrev: DataTypes.STRING,
    duration: DataTypes.STRING,
    punters: DataTypes.STRING,
    featuredVideoFile: DataTypes.STRING,
    featuredImageFile: DataTypes.STRING,
    featuredVideoId: DataTypes.STRING,
    featuredImageId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Podcasts',
    tableName: 'Podcasts',
    freezeTableName: true
  });

  //  Before the Records will be created, let's do the following.
  Podcast.beforeCreate((podcast) => {
    podcast.id = uuidV4();
  });

  return Podcast;
};
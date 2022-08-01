'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Podcasts', {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      contestantA: {
        allowNull: false,
        type: Sequelize.STRING
      },
      contestantB: {
        allowNull: false,
        type: Sequelize.STRING
      },
      sportsName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      leagueName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      leagueAbbrev: {
        allowNull: true,
        type: Sequelize.STRING
      },
      duration: {
        allowNull: false,
        type: Sequelize.STRING
      },
      punters: {
        allowNull: false,
        type: Sequelize.Sequelize.STRING
      },
      featuredVideoFile: {
        allowNull: true,
        type: Sequelize.STRING
      },
      featuredImageFile: {
        allowNull: true,
        type: Sequelize.STRING
      },
      featuredVideoId: {
        allowNull: true,
        type: Sequelize.STRING
      },
      featuredImageId: {
        allowNull: true,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Podcasts');
  }
};
'use strict';

import {v4 as uuidV4} from "uuid";
import bcrypt from "bcryptjs";

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    await queryInterface.bulkInsert("Users", [
      {
        id: uuidV4(),
        name: "Admin",
        phone: "08033407000",
        email: "admin@gmail.com",
        password: bcrypt.hashSync("password123", 10),
        role: 'Admin',
        isVerified: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidV4(),
        name: "Joel",
        phone: "08033407000",
        email: "joel@gmail.com",
        password: bcrypt.hashSync("password123", 10),
        role: 'Punter',
        isVerified: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidV4(),
        name: "Vincent",
        phone: "08033407000",
        email: "vincent@gmail.com",
        password: bcrypt.hashSync("password123", 10),
        role: 'Audience',
        picture: "http://res.cloudinary.com/dlzcrzwvg/image/upload/v1653573654/assets/images/profile_pictures/9d335cb1-f04d-4883-9506-6d801c3e3980_profile_photo.jpg",
        pictureId: "assets/images/profile_pictures/9d335cb1-f04d-4883-9506-6d801c3e3980_profile_photo",
        isVerified: false,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

     await queryInterface.bulkDelete('Users', null, {});
  }
};

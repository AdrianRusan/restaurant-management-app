'use strict';

const Chance = require('chance');
const chance = new Chance();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const restaurants = Array.from({ length: 100 }).map(() => ({
      name: chance.name(),
      address: chance.address(),
      email: chance.email(),
      phone: chance.phone(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('Restaurants', restaurants, {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Restaurants', null, {});
  }
};

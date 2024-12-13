'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Topics', [
      { topicID: uuidv4(), topicName: 'Mathematics', createdAt: new Date(), updatedAt: new Date() },
      { topicID: uuidv4(), topicName: 'Science', createdAt: new Date(), updatedAt: new Date() },
      { topicID: uuidv4(), topicName: 'History', createdAt: new Date(), updatedAt: new Date() },
      // Add more topics as needed
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Topics', null, {});
  },
};

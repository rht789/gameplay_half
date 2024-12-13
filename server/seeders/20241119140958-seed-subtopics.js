'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch topic IDs to associate subtopics correctly
    const topics = await queryInterface.sequelize.query(
      `SELECT topicID, topicName FROM Topics;`
    );

    const topicRows = topics[0];

    const subtopics = [
      {
        subtopicID: uuidv4(),
        topicID: topicRows.find(t => t.topicName === 'Mathematics').topicID,
        subtopicName: 'Algebra',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subtopicID: uuidv4(),
        topicID: topicRows.find(t => t.topicName === 'Mathematics').topicID,
        subtopicName: 'Geometry',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subtopicID: uuidv4(),
        topicID: topicRows.find(t => t.topicName === 'Science').topicID,
        subtopicName: 'Physics',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subtopicID: uuidv4(),
        topicID: topicRows.find(t => t.topicName === 'Science').topicID,
        subtopicName: 'Chemistry',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subtopicID: uuidv4(),
        topicID: topicRows.find(t => t.topicName === 'History').topicID,
        subtopicName: 'Ancient History',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Add more subtopics as needed
    ];

    await queryInterface.bulkInsert('Subtopics', subtopics, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Subtopics', null, {});
  },
};

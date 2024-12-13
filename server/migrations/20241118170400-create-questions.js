'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Questions', {
      questionID: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      questionText: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      questionType: {
        type: Sequelize.ENUM('MCQ', 'SHORT_ANSWER', 'FILL_IN_THE_BLANKS'),
        allowNull: false,
      },
      correctAns: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      source: {
        type: Sequelize.ENUM('AI', 'manual'),
        allowNull: false,
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        allowNull: false,
      },
      subtopicID: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Subtopics',
          key: 'subtopicID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Questions');
  },
};

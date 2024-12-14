'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create GameStates table
    await queryInterface.createTable('GameStates', {
      gameStateID: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      sessionID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sessions',
          key: 'sessionID'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('waiting', 'active', 'paused', 'finished'),
        defaultValue: 'waiting',
        allowNull: false
      },
      currentQuestionIndex: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      startTime: {
        type: Sequelize.DATE
      },
      endTime: {
        type: Sequelize.DATE
      },
      currentQuestionStartTime: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create PlayerResponses table
    await queryInterface.createTable('PlayerResponses', {
      responseID: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      participantID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Participants',
          key: 'participantID'
        },
        onDelete: 'CASCADE'
      },
      questionID: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Questions',
          key: 'questionID'
        },
        onDelete: 'CASCADE'
      },
      sessionID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sessions',
          key: 'sessionID'
        },
        onDelete: 'CASCADE'
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isCorrect: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      responseTime: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PlayerResponses');
    await queryInterface.dropTable('GameStates');
  }
}; 
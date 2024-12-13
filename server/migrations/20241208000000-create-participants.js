'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Participants', {
      participantID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sessionID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sessions',
          key: 'sessionID'
        }
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userID'
        }
      },
      status: {
        type: Sequelize.ENUM('waiting', 'approved'),
        defaultValue: 'waiting'
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
    await queryInterface.dropTable('Participants');
  }
}; 
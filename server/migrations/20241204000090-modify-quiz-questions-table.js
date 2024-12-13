'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add timestamps to Quiz_Questions table
    await queryInterface.addColumn('Quiz_Questions', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('Quiz_Questions', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Quiz_Questions', 'createdAt');
    await queryInterface.removeColumn('Quiz_Questions', 'updatedAt');
  }
}; 
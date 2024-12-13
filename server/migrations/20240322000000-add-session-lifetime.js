'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Sessions', 'sessionLifetime', {
      type: Sequelize.INTEGER,  // Store lifetime in hours
      allowNull: false,
      defaultValue: 24
    });
    await queryInterface.addColumn('Sessions', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Sessions', 'sessionLifetime');
    await queryInterface.removeColumn('Sessions', 'expiresAt');
  }
}; 
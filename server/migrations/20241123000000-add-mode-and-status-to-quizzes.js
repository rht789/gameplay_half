'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Quizzes', 'questionMode', {
      type: Sequelize.ENUM('manual', 'ai'),
      allowNull: false,
      defaultValue: 'manual'
    });

    await queryInterface.addColumn('Quizzes', 'status', {
      type: Sequelize.ENUM('draft', 'ready'),
      allowNull: false,
      defaultValue: 'draft'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Quizzes', 'questionMode');
    await queryInterface.removeColumn('Quizzes', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_Quizzes_questionMode;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_Quizzes_status;');
  }
}; 
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Quizzes', 'currentStep', {
      type: Sequelize.ENUM('initial', 'mode_selected', 'questions_added'),
      allowNull: false,
      defaultValue: 'initial'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Quizzes', 'currentStep');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_Quizzes_currentStep;');
  }
}; 
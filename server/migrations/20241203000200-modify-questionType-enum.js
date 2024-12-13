'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the existing column
    await queryInterface.removeColumn('Questions', 'questionType');
    
    // Add the column back with new ENUM values
    await queryInterface.addColumn('Questions', 'questionType', {
      type: Sequelize.ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANKS'),
      allowNull: false,
      defaultValue: 'MCQ'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the modified column
    await queryInterface.removeColumn('Questions', 'questionType');
    
    // Add back the original column
    await queryInterface.addColumn('Questions', 'questionType', {
      type: Sequelize.ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'),
      allowNull: false,
      defaultValue: 'MCQ'
    });
  }
}; 
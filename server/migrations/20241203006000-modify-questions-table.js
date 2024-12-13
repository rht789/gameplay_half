'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify correctAns to allow NULL
    await queryInterface.changeColumn('Questions', 'correctAns', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    // Modify questionType to include all required ENUM values
    await queryInterface.changeColumn('Questions', 'questionType', {
      type: Sequelize.ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANKS'),
      allowNull: false,
      defaultValue: 'MCQ'
    });

    // Check if createdAt column exists before adding
    const tableDescription = await queryInterface.describeTable('Questions');
    if (!tableDescription.createdAt) {
      await queryInterface.addColumn('Questions', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Check if updatedAt column exists before adding
    if (!tableDescription.updatedAt) {
      await queryInterface.addColumn('Questions', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes if needed
    await queryInterface.changeColumn('Questions', 'correctAns', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    await queryInterface.changeColumn('Questions', 'questionType', {
      type: Sequelize.ENUM('MCQ', 'TRUE_FALSE'),
      allowNull: false
    });

    // Remove columns if they exist
    const tableDescription = await queryInterface.describeTable('Questions');
    if (tableDescription.createdAt) {
      await queryInterface.removeColumn('Questions', 'createdAt');
    }
    if (tableDescription.updatedAt) {
      await queryInterface.removeColumn('Questions', 'updatedAt');
    }
  }
}; 
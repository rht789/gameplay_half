// migrations/XXXXXXXXXXXXXX-add-description-to-quizzes.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Quizzes', 'description', {
      type: Sequelize.TEXT,
      allowNull: false, // Set to true if the field should be optional
      defaultValue: '', // Optional: Set a default value if necessary
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Quizzes', 'description');
  },
};

const { sequelize, DataTypes } = require('../config/config');

const Quiz_Question = sequelize.define('Quiz_Question', {
  quizID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Quizzes',
      key: 'quizID'
    }
  },
  questionID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions',
      key: 'questionID'
    }
  }
}, {
  tableName: 'Quiz_Questions',
  timestamps: true
});

module.exports = Quiz_Question;
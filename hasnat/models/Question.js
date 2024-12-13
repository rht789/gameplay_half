// models/Question.js
const { sequelize, DataTypes } = require('../config/config');

const Question = sequelize.define('Question', {
    questionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000],  // question text between 10-1000 characters
        notEmpty: true
      }
    },
    questionType: {
      type: DataTypes.ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANKS'),
      allowNull: false,
      validate: {
        isIn: [['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANKS']]
      }
    },
    correctAns: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      validate: {
        isIn: [['easy', 'medium', 'hard']]
      }
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 5,    // minimum 5 seconds
        max: 300   // maximum 5 minutes
      }
    },
    subtopicID: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Questions',
    timestamps: true
  });



  module.exports = Question;

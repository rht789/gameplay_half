// models/Quiz.js
const { sequelize, DataTypes } = require('../config/config');

    const Quiz = sequelize.define('Quiz', {
      quizID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      quizName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [3, 255],
          notEmpty: true
        }
      },
      visibility: {
        type: DataTypes.ENUM('private', 'public'),
        allowNull: false,
        defaultValue: 'private',
        validate: {
          isIn: [['private', 'public']]
        }
      },
      topicID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 1000
        }
      },
      startAt: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toString() // Must be future date
        }
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [10, 1000],  // description between 10-1000 characters
          notEmpty: true
        }
      },
      questionMode: {
        type: DataTypes.ENUM('manual', 'ai'),
        allowNull: false,
        defaultValue: 'manual'
      },
      status: {
        type: DataTypes.ENUM('draft', 'ready'),
        allowNull: false,
        defaultValue: 'draft'
      },
      currentStep: {
        type: DataTypes.ENUM('initial', 'mode_selected', 'questions_added'),
        allowNull: false,
        defaultValue: 'initial'
      }
    }, {
      tableName: 'Quizzes',
      timestamps: true
    });
  

  
    module.exports = Quiz;
  
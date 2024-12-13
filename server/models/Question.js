// models/Question.js

module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    questionID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    questionType: {
      type: DataTypes.ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANKS'),
      allowNull: false
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
      allowNull: false
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subtopicID: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'Questions',
    timestamps: true
  });

  Question.associate = (models) => {
    Question.belongsToMany(models.Quiz, {
      through: 'Quiz_Question',
      foreignKey: 'questionID',
      otherKey: 'quizID'
    });
    Question.hasMany(models.Option, {
      foreignKey: 'questionID',
      as: 'options'
    });
  };

  return Question;
};

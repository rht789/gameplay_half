// models/Quiz.js
module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define('Quiz', {
    quizID: {
      type: DataTypes.CHAR(36),
      primaryKey: true
    },
    quizName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    visibility: {
      type: DataTypes.ENUM('private', 'public'),
      allowNull: true,
      defaultValue: 'private'
    },
    topicID: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false
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
      allowNull: false
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

  Quiz.associate = (models) => {
    Quiz.belongsTo(models.Topic, {
      foreignKey: 'topicID',
      as: 'topic'
    });
    Quiz.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Quiz.belongsToMany(models.Question, {
      through: 'Quiz_Questions',
      foreignKey: 'quizID',
      otherKey: 'questionID'
    });
  };

  return Quiz;
};

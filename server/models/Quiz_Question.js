module.exports = (sequelize, DataTypes) => {
  const Quiz_Question = sequelize.define('Quiz_Question', {
    quizID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'quizID'
      }
    },
    questionID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'questionID'
      }
    }
  }, {
    tableName: 'Quiz_Questions',
    timestamps: false
  });

  return Quiz_Question;
};
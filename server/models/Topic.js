// models/Topic.js

module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define('Topic', {
    topicID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    topicName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'Topics',
  });

  Topic.associate = (models) => {
    Topic.hasMany(models.Quiz, { as: 'quizzes', foreignKey: 'topicID' });
  };

  return Topic;
};

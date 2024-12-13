// models/Subtopic.js

module.exports = (sequelize, DataTypes) => {
  const Subtopic = sequelize.define('Subtopic', {
    subtopicID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subtopicName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topicID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Topics',
        key: 'topicID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  }, {
    timestamps: true,
    tableName: 'Subtopics',
  });

  return Subtopic;
};

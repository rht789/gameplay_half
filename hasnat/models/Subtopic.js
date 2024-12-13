// models/Subtopic.js

const { sequelize, DataTypes } = require('../config/config');

const Subtopic = sequelize.define('Subtopic', {
  subtopicID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subtopicName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  topicID: {
    type: DataTypes.INTEGER,
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

module.exports = Subtopic;

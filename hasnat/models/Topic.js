// models/Topic.js
const { sequelize, DataTypes } = require('../config/config');

const Topic = sequelize.define('Topic', {
  topicID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  topicName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  }
}, {
  timestamps: true,
  tableName: 'Topics',
});

module.exports = Topic;

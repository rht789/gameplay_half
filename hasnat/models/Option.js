// models/Option.js
const { sequelize, DataTypes } = require('../config/config');

const Option = sequelize.define('Option', {
  optionID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  optionText: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255],
      notEmpty: true
    }
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  questionID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions',
      key: 'questionID',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  timestamps: true,
  tableName: 'Options',
});

module.exports = Option;

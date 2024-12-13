const { sequelize, DataTypes } = require('../config/config');

const Session = sequelize.define('Session', {
  sessionID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sessionCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      len: [6, 6],  // exactly 6 characters
      isAlphanumeric: true,
      notEmpty: true
    }
  },
  hostID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userID',
    },
  },
  quizID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Quizzes',
      key: 'quizID',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, { 
  timestamps: true, 
  tableName: 'Sessions' 
});

module.exports = Session;

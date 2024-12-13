const { sequelize, DataTypes } = require('../config/config');

const Participant = sequelize.define('Participant', {
  participantID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sessionID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sessions',
      key: 'sessionID',
    },
  },
  userID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userID',
    },
  },
  status: {
    type: DataTypes.ENUM('waiting', 'approved'),
    defaultValue: 'waiting', 
  },
}, { 
  timestamps: true, 
  tableName: 'Participants' 
});

module.exports = Participant;

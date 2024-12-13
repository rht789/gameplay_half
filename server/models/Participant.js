'use strict';

module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define('Participant', {
    participantID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sessionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sessions',
        key: 'sessionID'
      }
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userID'
      }
    },
    status: {
      type: DataTypes.ENUM('waiting', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'waiting'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'Participants',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['sessionID', 'userID']
      }
    ]
  });

  return Participant;
}; 
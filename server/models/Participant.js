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
      defaultValue: 'waiting'
    }
  }, {
    tableName: 'Participants',
    indexes: [
      {
        unique: true,
        fields: ['sessionID', 'userID'],
        name: 'unique_session_participant'
      }
    ]
  });

  Participant.associate = function(models) {
    Participant.belongsTo(models.Session, {
      foreignKey: 'sessionID',
      as: 'participantSession'
    });

    Participant.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'participantUser'
    });
  };

  return Participant;
}; 
'use strict';

module.exports = (sequelize, DataTypes) => {
  const PlayerResponse = sequelize.define('PlayerResponse', {
    responseID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    participantID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Participants',
        key: 'participantID'
      }
    },
    questionID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'questionID'
      }
    },
    sessionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sessions',
        key: 'sessionID'
      }
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    responseTime: {
      type: DataTypes.INTEGER
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'PlayerResponses',
    timestamps: true
  });

  PlayerResponse.associate = function(models) {
    PlayerResponse.belongsTo(models.Participant, {
      foreignKey: 'participantID',
      as: 'participant'
    });
    PlayerResponse.belongsTo(models.Question, {
      foreignKey: 'questionID',
      as: 'question'
    });
    PlayerResponse.belongsTo(models.Session, {
      foreignKey: 'sessionID',
      as: 'session'
    });
  };

  return PlayerResponse;
}; 
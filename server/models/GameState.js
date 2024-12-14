'use strict';

module.exports = (sequelize, DataTypes) => {
  const GameState = sequelize.define('GameState', {
    gameStateID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sessionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sessions',
        key: 'sessionID'
      }
    },
    status: {
      type: DataTypes.ENUM('waiting', 'active', 'paused', 'finished'),
      defaultValue: 'waiting',
      allowNull: false
    },
    currentQuestionIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    startTime: {
      type: DataTypes.DATE
    },
    endTime: {
      type: DataTypes.DATE
    },
    currentQuestionStartTime: {
      type: DataTypes.DATE
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
    tableName: 'GameStates',
    timestamps: true
  });

  GameState.associate = function(models) {
    GameState.belongsTo(models.Session, {
      foreignKey: 'sessionID',
      as: 'session'
    });
  };

  return GameState;
}; 
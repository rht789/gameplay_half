'use strict';

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    sessionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sessionCode: {
      type: DataTypes.STRING(6),
      allowNull: false,
      unique: true,
      validate: {
        len: [6, 6],
        notEmpty: true
      }
    },
    hostID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userID'
      }
    },
    quizID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'quizID'
      }
    },
    isActive: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1
    },
    participantCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    sessionLifetime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 24
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Sessions',
    timestamps: true
  });

  Session.associate = function(models) {
    Session.belongsTo(models.User, {
      foreignKey: 'hostID',
      as: 'sessionHost'
    });
    Session.belongsTo(models.Quiz, {
      foreignKey: 'quizID',
      as: 'sessionQuiz'
    });
    Session.hasMany(models.Participant, {
      foreignKey: 'sessionID',
      as: 'sessionParticipants'
    });
  };

  return Session;
}; 
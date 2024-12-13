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
      unique: true,
      allowNull: false,
      validate: {
        len: {
          args: [6, 6],
          msg: 'Session code must be exactly 6 characters long'
        },
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'quizID'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    startTime: {
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
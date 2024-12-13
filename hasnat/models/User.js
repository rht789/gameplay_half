const { sequelize, DataTypes } = require('../config/config');

const User = sequelize.define('User', {
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 50],  // username between 3-50 characters
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100],  // password minimum 6 characters
      notEmpty: true
    }
  },
  refreshToken: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  }
}, {
  timestamps: true,
  tableName: 'Users'
});

module.exports = User;

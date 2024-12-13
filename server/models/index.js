// models/index.js

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      dialect: config.dialect,
      port: config.port,
      logging: false // Set to console.log to see SQL queries
    }
  );
}

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add these associations to your existing associations

// Session Associations
db.Session.belongsTo(db.User, {
  foreignKey: 'hostID',
  as: 'host',
  onDelete: 'CASCADE'
});

db.Session.belongsTo(db.Quiz, {
  foreignKey: 'quizID',
  as: 'quiz',
  onDelete: 'CASCADE'
});

db.Session.hasMany(db.Participant, {
  foreignKey: 'sessionID',
  as: 'participants',
  onDelete: 'CASCADE'
});

// Participant Associations
db.Participant.belongsTo(db.Session, {
  foreignKey: 'sessionID',
  as: 'session'
});

db.Participant.belongsTo(db.User, {
  foreignKey: 'userID',
  as: 'user'
});

// User Associations (add these if not already present)
db.User.hasMany(db.Session, {
  foreignKey: 'hostID',
  as: 'hostedSessions'
});

db.User.hasMany(db.Participant, {
  foreignKey: 'userID',
  as: 'participations'
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

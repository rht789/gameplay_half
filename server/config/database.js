// config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './.env' }); // Ensure environment variables are loaded

// Destructure database-related environment variables
const {
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_DIALECT = 'mysql',
} = process.env;

// Validate essential database environment variables
if (!DB_NAME || !DB_USER || !DB_PASS) {
  console.error('Error: Database configuration is incomplete in the .env file.');
  process.exit(1);
}

// Initialize Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: console.log, // Enable SQL query logging
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Log database details (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Database config:', {
        name: process.env.DB_NAME,
        host: process.env.DB_HOST,
        user: process.env.DB_USER
      });
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit if database connection fails
  }
};

// Immediately test the connection upon requiring this file
testConnection();

module.exports = sequelize;

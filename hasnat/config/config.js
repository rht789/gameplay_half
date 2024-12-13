require('dotenv').config(); // Load environment variables from .env
const { Sequelize, DataTypes } = require('sequelize');

// Validate environment variables
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST', 'DB_PORT', 'JWT_SECRET'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not set in the environment variables.`);
  }
});

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log, // Log SQL queries for debugging
  }
);

// Export the Sequelize instance only
module.exports = { sequelize, DataTypes }; // Export the Sequelize instance


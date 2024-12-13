// config/config.js

require('dotenv').config();

const {
  JWT_SECRET,
  PORT,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

// Validate essential environment variables
if (!JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined in the .env file.');
  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('Error: Email configuration is incomplete in the .env file.');
  process.exit(1);
}

const config = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "quiz",
    database: process.env.DB_NAME || "quizmaster",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql"
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "quiz",
    database: process.env.DB_NAME || "quizmaster",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "quiz",
    database: process.env.DB_NAME || "quizmaster",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql"
  },
  jwtSecret: JWT_SECRET,
  port: PORT || 5000,
  email: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  }
};

module.exports = config;
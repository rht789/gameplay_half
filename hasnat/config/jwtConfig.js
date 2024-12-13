require('dotenv').config(); // Load environment variables

// Export the JWT secret
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in the environment variables.');
}

module.exports = process.env.JWT_SECRET;

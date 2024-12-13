// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtConfig'); // Import JWT secret

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1]; // Extract token without 'Bearer'

  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }

    console.log('Decoded Token:', decoded);

        // Attach decoded payload to req.user
        req.user = {
          userId: decoded.id, // Attach `id` as `userId`
          email: decoded.email // Optionally include email
        };
        
    next();
  });
};

module.exports = authMiddleware;

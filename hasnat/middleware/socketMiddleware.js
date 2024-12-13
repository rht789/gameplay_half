const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwtConfig');

const socketAuthMiddleware = (socket, next) => {
  // Check multiple possible token locations
  const token = 
    socket.handshake.auth?.token || 
    socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
    socket.handshake.query?.token;

  console.log('Received token:', token ? 'Token exists' : 'No token');

  if (!token) {
    console.log('No token provided in connection attempt');
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, secret);
    console.log('Token verified successfully:', decoded);
    socket.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return next(new Error(`Authentication error: ${err.message}`));
  }
};

module.exports = socketAuthMiddleware;

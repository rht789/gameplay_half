const jwt = require('jsonwebtoken');

const socketAuthMiddleware = (socket, next) => {
  const token = 
    socket.handshake.auth?.token || 
    socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
    socket.handshake.query?.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error(`Authentication error: ${err.message}`));
  }
};

module.exports = socketAuthMiddleware; 
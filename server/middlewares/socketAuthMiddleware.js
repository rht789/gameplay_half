const jwt = require('jsonwebtoken');
const { User } = require('../models');

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user to socket
    socket.user = {
      id: user.userID,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error(error.message || 'Authentication failed'));
  }
};

module.exports = socketAuthMiddleware; 
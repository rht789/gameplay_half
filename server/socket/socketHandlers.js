const { Server } = require('socket.io');
const socketAuthMiddleware = require('../middlewares/socketAuthMiddleware');
const { Session, User } = require('../models');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
  });

  const activeSessions = new Map();

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_session', async ({ sessionId, userId }) => {
      try {
        console.log(`Client ${socket.id} joining session ${sessionId}`);
        
        // Verify session exists
        const session = await Session.findByPk(sessionId);
        if (!session) {
          throw new Error('Session not found');
        }

        // Get user details
        const user = await User.findByPk(userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Store user info on socket
        socket.user = {
          id: user.userID,
          username: user.username
        };

        // Join room
        const roomId = `session:${sessionId}`;
        socket.join(roomId);

        // Track session participants
        if (!activeSessions.has(sessionId)) {
          activeSessions.set(sessionId, new Set());
        }
        activeSessions.get(sessionId).add(socket.id);

        // Notify others
        socket.to(roomId).emit('participant_joined', {
          id: socket.id,
          ...socket.user
        });

        // Send current participants
        const participants = Array.from(activeSessions.get(sessionId))
          .map(sid => {
            const participantSocket = io.sockets.sockets.get(sid);
            return participantSocket?.user ? {
              id: participantSocket.id,
              ...participantSocket.user
            } : null;
          })
          .filter(Boolean);

        socket.emit('participants_list', participants);

      } catch (error) {
        console.error('Error in join_session:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Clean up from all sessions
      activeSessions.forEach((clients, sessionId) => {
        if (clients.has(socket.id)) {
          clients.delete(socket.id);
          io.to(`session:${sessionId}`).emit('participant_left', {
            id: socket.id,
            ...socket.user
          });
          if (clients.size === 0) {
            activeSessions.delete(sessionId);
          }
        }
      });
    });
  });

  return io;
}; 
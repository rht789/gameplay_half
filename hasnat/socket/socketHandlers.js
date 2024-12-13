const { Session, Participant } = require('../models');

module.exports = (io) => {
  io.use(require('../middleware/socketMiddleware'));

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinRoom', async ({ sessionCode }) => {
      try {
        const session = await Session.findOne({ where: { sessionCode, isActive: true } });
        if (!session) throw new Error('Invalid session');

        const participant = await Participant.findOne({ where: { sessionId: session.sessionId, userId: socket.user.userId } });
        if (!participant) throw new Error('User not part of the session');

        socket.join(sessionCode);
        io.to(sessionCode).emit('userJoined', { userId: socket.user.userId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

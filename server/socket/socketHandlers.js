const { Session, Participant, User } = require('../models');

module.exports = (io) => {
  io.use(require('../middleware/socketMiddleware'));

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join waiting room for participants
    socket.on('join-waiting-room', async ({ sessionId }) => {
      try {
        const session = await Session.findOne({
          where: { sessionID: sessionId, isActive: true },
          include: [{
            model: Participant,
            as: 'participants',
            include: [{
              model: User,
              as: 'user',
              attributes: ['username']
            }]
          }]
        });

        if (!session) throw new Error('Session not found');

        // Check if user is a participant
        const participant = await Participant.findOne({
          where: { 
            sessionID: sessionId,
            userID: socket.user.id
          }
        });

        if (!participant) throw new Error('Not authorized to join this session');

        socket.join(`session:${sessionId}`);
        socket.emit('status-update', { status: participant.status });
        
        // Notify host about new participant
        io.to(`session:${sessionId}`).emit('participant-joined', {
          id: participant.participantID,
          username: socket.user.username,
          status: participant.status
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Host joining their session
    socket.on('join-session', async ({ sessionId }) => {
      try {
        const session = await Session.findOne({
          where: { 
            sessionID: sessionId,
            hostID: socket.user.id,
            isActive: true 
          },
          include: [{
            model: Participant,
            as: 'participants',
            include: [{
              model: User,
              as: 'user',
              attributes: ['username']
            }]
          }]
        });

        if (!session) throw new Error('Session not found or not authorized');

        socket.join(`session:${sessionId}`);
        socket.emit('session-update', {
          participants: session.participants.map(p => ({
            id: p.participantID,
            username: p.user.username,
            status: p.status
          }))
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Host approving a participant
    socket.on('approve-participant', async ({ sessionId, participantId }) => {
      try {
        const session = await Session.findOne({
          where: { sessionID: sessionId, hostID: socket.user.id }
        });

        if (!session) throw new Error('Not authorized to manage this session');

        const participant = await Participant.findByPk(participantId);
        if (!participant) throw new Error('Participant not found');

        await participant.update({ status: 'approved' });
        
        io.to(`session:${sessionId}`).emit('participant-status-changed', {
          participantId,
          status: 'approved'
        });

        // Notify the specific participant
        socket.to(`session:${sessionId}`).emit('status-update', {
          status: 'approved'
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Host removing a participant
    socket.on('remove-participant', async ({ sessionId, participantId }) => {
      try {
        const session = await Session.findOne({
          where: { sessionID: sessionId, hostID: socket.user.id }
        });

        if (!session) throw new Error('Not authorized to manage this session');

        const participant = await Participant.findByPk(participantId);
        if (!participant) throw new Error('Participant not found');

        await participant.destroy();
        
        io.to(`session:${sessionId}`).emit('participant-removed', {
          participantId
        });

        // Notify the removed participant
        socket.to(`session:${sessionId}`).emit('removed-from-session');
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Host starting the quiz
    socket.on('start-quiz', async ({ sessionId }) => {
      try {
        const session = await Session.findOne({
          where: { sessionID: sessionId, hostID: socket.user.id }
        });

        if (!session) throw new Error('Not authorized to manage this session');

        await session.update({ 
          startTime: new Date()
        });
        
        io.to(`session:${sessionId}`).emit('quiz-started', {
          sessionId,
          startTime: session.startTime
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}; 
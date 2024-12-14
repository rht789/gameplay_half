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

        const participant = await Participant.findOne({
          where: { 
            sessionID: sessionId,
            userID: socket.user.id
          }
        });

        if (!participant) throw new Error('Not authorized to join this session');

        socket.join(`session:${sessionId}`);
        
        // Emit current status to the joining participant
        socket.emit('participant-status-changed', { 
          participantId: participant.participantID,
          status: participant.status 
        });
        
        // Notify all clients in the session about the new participant
        io.in(`session:${sessionId}`).emit('participant-joined', {
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
        console.log('Approve participant request:', { sessionId, participantId });
        
        const session = await Session.findOne({
          where: { sessionID: sessionId, hostID: socket.user.id }
        });

        if (!session) throw new Error('Not authorized to manage this session');

        const participant = await Participant.findByPk(participantId);
        if (!participant) throw new Error('Participant not found');

        await participant.update({ status: 'approved' });
        
        console.log('Emitting status change:', { participantId, status: 'approved' });
        
        // Emit to all clients in the session
        io.to(`session:${sessionId}`).emit('participant-status-changed', {
          participantId: parseInt(participantId),
          status: 'approved'
        });
      } catch (err) {
        console.error('Error in approve-participant:', err);
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
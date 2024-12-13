const { Session, Participant, User } = require('../models');

const waitingRoomHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    let currentSessionId = null;

    socket.on('join-session', async ({ sessionId }) => {
      try {
        currentSessionId = sessionId;
        socket.join(`session:${sessionId}`);
        console.log(`Client ${socket.id} joined session ${sessionId}`);

        // Get session details and emit to all clients in the session
        const session = await Session.findOne({
          where: { sessionID: sessionId },
          include: [{
            model: Participant,
            as: 'sessionParticipants',
            include: [{
              model: User,
              as: 'participantUser',
              attributes: ['username']
            }]
          }]
        });

        if (session) {
          const participants = session.sessionParticipants.map(p => ({
            id: p.participantID,
            username: p.participantUser.username,
            status: p.status
          }));

          // Emit to all clients in the session
          io.to(`session:${sessionId}`).emit('session-update', {
            participants
          });
        }
      } catch (error) {
        console.error('Error in join-session:', error);
      }
    });

    socket.on('approve-participant', async ({ sessionId, participantId }) => {
      try {
        await Participant.update(
          { status: 'approved' },
          { where: { participantID: participantId } }
        );

        io.to(`session:${sessionId}`).emit('participant-approved', {
          participantId,
          status: 'approved'
        });
      } catch (error) {
        console.error('Error approving participant:', error);
      }
    });

    socket.on('remove-participant', async ({ sessionId, participantId }) => {
      try {
        // Get session to verify host
        const session = await Session.findOne({
          where: { sessionID: sessionId }
        });

        // Verify the requester is the host
        if (session.hostID !== socket.user.id) {
          return;
        }

        // Get participant details before removal
        const participant = await Participant.findOne({
          where: { participantID: participantId },
          include: [{ model: User, as: 'participantUser' }]
        });

        if (!participant) return;

        // Remove the participant
        await Participant.destroy({
          where: { participantID: participantId }
        });

        // Emit removal event to all clients in the session
        io.to(`session:${sessionId}`).emit('participant-removed', {
          participantId,
          userId: participant.userID
        });

      } catch (error) {
        console.error('Error removing participant:', error);
      }
    });

    socket.on('disconnect', () => {
      if (currentSessionId) {
        socket.leave(`session:${currentSessionId}`);
      }
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = waitingRoomHandler; 
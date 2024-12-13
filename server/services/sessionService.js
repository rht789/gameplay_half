const { Session, Participant } = require('../models');
const generateCode = require('../utils/generateCode');

const createSession = async (hostId, quizId) => {
  try {
    const sessionCode = generateCode();
    const session = await Session.create({ 
      hostID: hostId, 
      quizID: quizId,
      sessionCode,
      participantCount: 1,
      isActive: true
    });
    
    await Participant.create({ 
      sessionID: session.sessionID, 
      userID: hostId,
      status: 'approved'
    });
    
    return {
      sessionId: session.sessionID,
      sessionCode: session.sessionCode,
      hostId: session.hostID,
      isActive: session.isActive
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

const joinSession = async (sessionCode, userId) => {
  const session = await Session.findOne({ 
    where: { 
      sessionCode, 
      isActive: true 
    } 
  });
  
  if (!session) throw new Error('Invalid or inactive session');

  const participantExists = await Participant.findOne({ 
    where: { 
      sessionID: session.sessionID, 
      userID: userId 
    } 
  });
  
  if (participantExists) throw new Error('User already joined');

  await Participant.create({ 
    sessionID: session.sessionID, 
    userID: userId,
    status: 'waiting' // New participants start in waiting status
  });

  await session.increment('participantCount');
  
  return session;
};

module.exports = { createSession, joinSession }; 
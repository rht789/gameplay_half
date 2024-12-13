const { Session, Participant, User, Quiz } = require('../models');
const sessionService = require('../services/sessionService');

const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findOne({
      where: { 
        sessionID: sessionId,
        isActive: true
      },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['quizName']
        },
        {
          model: Participant,
          as: 'participants',
          include: [{
            model: User,
            as: 'user',
            attributes: ['username']
          }]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is host or participant
    const isHost = session.hostID === req.user.id;
    const isParticipant = session.participants.some(p => p.userID === req.user.id);

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this session'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.sessionID,
        sessionCode: session.sessionCode,
        quizName: session.quiz.quizName,
        hostId: session.hostID,
        isActive: session.isActive,
        participants: session.participants.map(p => ({
          id: p.participantID,
          username: p.user.username,
          status: p.status
        }))
      }
    });
  } catch (error) {
    console.error('Error in getSessionDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createSession = async (req, res) => {
  try {
    const { quizId } = req.body;
    const hostId = req.user.id;

    const session = await sessionService.createSession(hostId, quizId);

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error in createSession:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create session'
    });
  }
};

const joinSession = async (req, res) => {
  try {
    const { sessionCode } = req.body;
    const userId = req.user.id;

    const session = await sessionService.joinSession(sessionCode, userId);

    res.json({
      success: true,
      data: {
        sessionId: session.sessionID,
        sessionCode: session.sessionCode
      }
    });
  } catch (error) {
    console.error('Error in joinSession:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join session'
    });
  }
};

module.exports = {
  getSessionDetails,
  createSession,
  joinSession
}; 
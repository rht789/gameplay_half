const { Session, Participant, User, Quiz, Question, GameState, PlayerResponse } = require('../models');

// Store active games in memory for better performance
const activeGames = new Map();

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
        console.log(`Socket ${socket.id} joining session:`, sessionId);
        
        // Join the session room
        socket.join(`session:${sessionId}`);

        // Check if there's an active game for this session
        const gameData = activeGames.get(sessionId);
        if (gameData) {
          console.log('Active game found, sending current question');
          // Send current question to the newly joined participant
          const currentQuestion = gameData.questions[gameData.currentIndex];
          if (currentQuestion) {
            const questionData = {
              questionID: currentQuestion.questionID,
              questionText: currentQuestion.questionText,
              options: currentQuestion.options,
              timeLimit: currentQuestion.timeLimit || 30,
              questionNumber: gameData.currentIndex + 1,
              totalQuestions: gameData.questions.length,
              type: currentQuestion.questionType
            };
            socket.emit('next-question', questionData);
          }
        }
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
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

    // Host starts the quiz
    socket.on('start-quiz', async ({ sessionId }) => {
      try {
        console.log('Starting quiz for session:', sessionId);
        
        const session = await Session.findOne({
          where: { 
            sessionID: sessionId, 
            hostID: socket.user.id,
            isActive: true
          },
          include: [{
            model: Quiz,
            as: 'quiz',
            include: [{
              model: Question,
              through: { attributes: [] }
            }]
          }]
        });

        if (!session) {
          throw new Error('Session not found or not authorized');
        }

        if (!session.quiz.Questions || session.quiz.Questions.length === 0) {
          throw new Error('No questions available for this quiz');
        }

        console.log('Found questions:', session.quiz.Questions.length);

        // Update session status
        await session.update({ 
          status: 'in_progress',
          startTime: new Date()
        });

        // Create game state
        const gameState = await GameState.create({
          sessionID: sessionId,
          status: 'active',
          currentQuestionIndex: 0,
          startTime: new Date()
        });

        // Store game data in memory
        const gameData = {
          questions: session.quiz.Questions,
          currentIndex: 0,
          participants: new Map(),
          startTime: new Date(),
          questionStartTime: null
        };

        // Store in active games
        activeGames.set(sessionId, gameData);

        console.log('Game state initialized');

        // Notify all participants
        io.to(`session:${sessionId}`).emit('quiz-started', {
          totalQuestions: session.quiz.Questions.length
        });

        // Start first question after delay
        setTimeout(() => {
          sendNextQuestion(io, sessionId);
        }, 3000);

        console.log('Quiz started successfully');

      } catch (error) {
        console.error('Error starting quiz:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle participant answers
    socket.on('submit-answer', async ({ sessionId, answer }) => {
      try {
        const gameData = activeGames.get(sessionId);
        if (!gameData) throw new Error('Game not found');

        const participant = await Participant.findOne({
          where: { 
            sessionID: sessionId,
            userID: socket.user.id,
            status: 'approved'
          }
        });

        if (!participant) throw new Error('Not authorized to submit answer');

        const currentQuestion = gameData.questions[gameData.currentIndex];
        const responseTime = Date.now() - gameData.questionStartTime;
        const isCorrect = checkAnswer(currentQuestion, answer);

        // Save response
        await PlayerResponse.create({
          participantID: participant.participantID,
          questionID: currentQuestion.questionID,
          sessionID: sessionId,
          answer,
          isCorrect,
          responseTime,
          score: calculateScore(isCorrect, responseTime),
          submittedAt: new Date()
        });

        // Update participant score in memory
        const participantData = gameData.participants.get(participant.participantID) || {
          score: 0,
          correctAnswers: 0
        };

        if (isCorrect) {
          participantData.score += calculateScore(isCorrect, responseTime);
          participantData.correctAnswers++;
        }

        gameData.participants.set(participant.participantID, participantData);

        // Acknowledge submission
        socket.emit('answer-received', { isCorrect });

      } catch (error) {
        console.error('Error submitting answer:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

// Helper Functions
async function sendNextQuestion(io, sessionId) {
  try {
    console.log('Sending next question for session:', sessionId);
    const gameData = activeGames.get(sessionId);
    
    if (!gameData) {
      console.error('No game data found for session:', sessionId);
      return;
    }

    const currentQuestion = gameData.questions[gameData.currentIndex];
    if (!currentQuestion) {
      console.log('No more questions, ending game');
      endGame(io, sessionId);
      return;
    }

    console.log('Current question:', currentQuestion);

    // Update game state
    await GameState.update({
      currentQuestionIndex: gameData.currentIndex,
      currentQuestionStartTime: new Date()
    }, {
      where: { sessionID: sessionId }
    });

    gameData.questionStartTime = Date.now();

    // Parse options if they're stored as a string
    let options = currentQuestion.options;
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        console.error('Error parsing options:', e);
        options = [];
      }
    }

    // Prepare question data (excluding correct answer)
    const questionData = {
      questionID: currentQuestion.questionID,
      questionText: currentQuestion.questionText,
      options: options,
      timeLimit: currentQuestion.timeLimit || 30,
      questionNumber: gameData.currentIndex + 1,
      totalQuestions: gameData.questions.length,
      type: currentQuestion.questionType
    };

    console.log('Sending question data:', questionData);

    // Send to all participants in the session
    io.to(`session:${sessionId}`).emit('next-question', questionData);

    // Set question timer
    setTimeout(() => {
      handleQuestionTimeout(io, sessionId);
    }, (currentQuestion.timeLimit || 30) * 1000);

  } catch (error) {
    console.error('Error sending next question:', error);
    io.to(`session:${sessionId}`).emit('error', { 
      message: 'Error loading next question' 
    });
  }
}

function handleQuestionTimeout(io, sessionId) {
  try {
    const gameData = activeGames.get(sessionId);
    if (!gameData) return;

    const currentQuestion = gameData.questions[gameData.currentIndex];
    if (!currentQuestion) return;

    // Get correct option
    let correctAnswer = currentQuestion.correctAns;
    if (currentQuestion.options) {
      const options = JSON.parse(currentQuestion.options);
      const correctOption = options.find(opt => opt.isCorrect);
      if (correctOption) {
        correctAnswer = correctOption.optionText;
      }
    }

    // Send results
    io.to(`session:${sessionId}`).emit('question-end', {
      correctAnswer,
      scores: Array.from(gameData.participants.entries()).map(([participantId, data]) => ({
        participantId,
        score: data.score,
        correctAnswers: data.correctAnswers
      }))
    });

    // Move to next question after delay
    gameData.currentIndex++;
    setTimeout(() => {
      sendNextQuestion(io, sessionId);
    }, 5000);
  } catch (error) {
    console.error('Error handling question timeout:', error);
  }
}

function checkAnswer(question, answer) {
  try {
    switch (question.questionType) {
      case 'MCQ':
        if (question.options) {
          const options = JSON.parse(question.options);
          const correctOption = options.find(opt => opt.isCorrect);
          return answer === correctOption?.optionText;
        }
        return answer === question.correctAns;
      case 'TRUE_FALSE':
        return answer.toLowerCase() === question.correctAns.toLowerCase();
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
}

function calculateScore(isCorrect, responseTime) {
  if (!isCorrect) return 0;
  const baseScore = 1000;
  const timePenalty = Math.floor(responseTime / 100); // Lose points per 100ms
  return Math.max(0, baseScore - timePenalty);
}

async function endGame(io, sessionId) {
  const gameData = activeGames.get(sessionId);
  if (!gameData) return;

  // Update game state
  await GameState.update({
    status: 'finished',
    endTime: new Date()
  }, {
    where: { sessionID: sessionId }
  });

  // Send final results
  io.to(`session:${sessionId}`).emit('game-end', {
    finalScores: Array.from(gameData.participants.entries()).map(([participantId, data]) => ({
      participantId,
      score: data.score,
      correctAnswers: data.correctAnswers
    }))
  });

  // Cleanup
  activeGames.delete(sessionId);
} 
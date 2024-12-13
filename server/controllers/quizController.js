// server/controllers/quizController.js

const { Quiz, Topic, Question, Option, Session, Participant } = require('../models');
const { v4: uuidv4 } = require('uuid');
const quizService = require('../services/quizService');
const Quiz_Question = require('../models/Quiz_Question');
const generateCode = require('../utils/generateCode');

// Create a controller object to hold all methods
const quizController = {
  // Get all quizzes
  getQuizzes: async (req, res) => {
    try {
      const userID = req.user?.id;
      
      if (!userID) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const quizzes = await quizService.listQuizzes(userID);
      
      return res.status(200).json(quizzes);
    } catch (error) {
      console.error('Quiz Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch quizzes',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get a specific quiz
  getQuiz: async (req, res) => {
    try {
      const quiz = await Quiz.findOne({
        where: { 
          quizID: req.params.id,
          createdBy: req.user.id 
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching quiz'
      });
    }
  },

  // Create a new quiz
  createQuiz: async (req, res) => {
    try {
      const {
        quizName,
        description,
        visibility = 'private',
        maxParticipants,
        topicName,
        startAt
      } = req.body;

      // Check if the topic already exists
      let topic = await Topic.findOne({ where: { topicName } });

      // If the topic doesn't exist, create it
      if (!topic) {
        topic = await Topic.create({
          topicID: uuidv4(),
          topicName
        });
      }

      // Create the quiz with default values for questionMode, status, and currentStep
      const quiz = await Quiz.create({
        quizID: uuidv4(),
        quizName,
        description,
        visibility,
        topicID: topic.topicID,
        createdBy: req.user.id,
        maxParticipants,
        startAt,
        // questionMode, status, and currentStep will use default values from the model
      });

      res.status(201).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error creating quiz:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error creating quiz',
        error: error.message
      });
    }
  },

  // Update a quiz
  updateQuiz: async (req, res) => {
    try {
      const quiz = await Quiz.findOne({
        where: { 
          quizID: req.params.id,
          createdBy: req.user.id 
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      await quiz.update(req.body);

      res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error updating quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating quiz'
      });
    }
  },

  // Delete a quiz
  deleteQuiz: async (req, res) => {
    try {
      const quiz = await Quiz.findOne({
        where: { 
          quizID: req.params.id,
          createdBy: req.user.id 
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      await quiz.destroy();

      res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting quiz'
      });
    }
  },

  // New function to update question mode
  updateQuestionMode: async (req, res) => {
    try {
      const { quizID } = req.params;
      const { mode } = req.body;

      console.log('Updating quiz mode:', { quizID, mode, userId: req.user.id }); // Debug log

      // Validate mode
      if (!['manual', 'ai'].includes(mode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mode. Must be either "manual" or "ai"'
        });
      }

      const quiz = await Quiz.findOne({
        where: { 
          quizID,
          createdBy: req.user.id  // Make sure we're using the correct user ID field
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      await quiz.update({ 
        questionMode: mode,
        currentStep: 'mode_selected'
      });

      res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error updating question mode:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating question mode',
        error: error.message
      });
    }
  },

  // Add this new method
  validateQuizStep: async (req, res) => {
    try {
      const { quizID } = req.params;
      const { step } = req.body;

      console.log('Validating quiz step:', { quizID, step, userId: req.user.id }); // Debug log

      // Validate step value
      const validSteps = ['initial', 'mode_selected', 'questions_added'];
      if (!validSteps.includes(step)) {
        return res.status(400).json({
          success: false,
          message: `Invalid step. Must be one of: ${validSteps.join(', ')}`
        });
      }

      const quiz = await Quiz.findOne({
        where: { 
          quizID,
          createdBy: req.user.id 
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // Update the quiz step
      await quiz.update({ currentStep: step });

      res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error validating quiz step:', error);
      res.status(500).json({
        success: false,
        message: 'Error validating quiz step',
        error: error.message
      });
    }
  },

  updateQuizMode: async (req, res) => {
    try {
      const { id } = req.params;
      const { mode } = req.body;

      console.log('Updating quiz mode:', { id, mode, userId: req.user.id }); // Debug log

      const quiz = await Quiz.findOne({
        where: { 
          quizID: id,
          createdBy: req.user.id 
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      await quiz.update({ 
        questionMode: mode,
        currentStep: 'mode_selected'
      });

      res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error updating quiz mode:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating quiz mode',
        error: error.message
      });
    }
  },

  updateQuizStep: async (req, res) => {
    try {
      const { id } = req.params;
      const { step } = req.body;

      const quiz = await Quiz.findOne({
        where: { 
          quizID: id,
          createdBy: req.user.id 
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      await quiz.update({ currentStep: step });

      res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error updating quiz step:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating quiz step'
      });
    }
  },

  createQuestion: async (req, res) => {
    try {
      const { quizID, questionText, questionType, difficulty, timeLimit, options } = req.body;
      
      const question = await Quiz_Question.create({
        quizID,
        questionText,
        questionType,
        difficulty,
        timeLimit,
        options
      });

      res.status(201).json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating question'
      });
    }
  },

  finalizeQuiz: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log('Finalizing quiz:', { quizId: id, userId: req.user.id });

      // First find the quiz
      const quiz = await Quiz.findOne({
        where: { 
          quizID: id,
          createdBy: req.user.id 
        },
        include: [{
          model: Question,
          through: Quiz_Question
        }]
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // Check if quiz has questions using the included Questions
      if (!quiz.Questions || quiz.Questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot finalize quiz without any questions'
        });
      }

      // Update quiz status
      await quiz.update({ 
        status: 'ready',
        currentStep: 'questions_added'
      });

      // Fetch the updated quiz
      const updatedQuiz = await Quiz.findOne({
        where: { quizID: id },
        include: [{
          model: Question,
          through: Quiz_Question
        }]
      });

      res.status(200).json({
        success: true,
        data: updatedQuiz,
        message: 'Quiz finalized successfully'
      });
    } catch (error) {
      console.error('Error finalizing quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error finalizing quiz',
        error: error.message
      });
    }
  },

  startSession: async (req, res) => {
    try {
      const { id: quizId } = req.params;
      const hostId = req.user.id;

      // Verify quiz exists and is ready
      const quiz = await Quiz.findOne({
        where: {
          quizID: quizId,
          status: 'ready',
          createdBy: hostId
        }
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found or not ready'
        });
      }

      // Generate session code
      const sessionCode = generateCode();
      console.log('Generated session code:', sessionCode);

      // Verify code length before creating session
      if (sessionCode.length !== 6) {
        throw new Error(`Invalid session code length: ${sessionCode.length}`);
      }

      // Create session
      const session = await Session.create({
        sessionCode,
        hostID: hostId,
        quizID: quizId,
        isActive: true
      });

      res.status(201).json({
        success: true,
        data: {
          sessionId: session.sessionID,
          sessionCode: session.sessionCode,
          quizName: quiz.quizName
        }
      });

    } catch (error) {
      console.error('Start session error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error starting session'
      });
    }
  }
};

// Export the controller object
module.exports = quizController;

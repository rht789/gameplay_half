// server/routes/v1/quizRoutes.js

const express = require('express');
const router = express.Router();
const quizController = require('../../controllers/quizController');
const questionController = require('../../controllers/questionController');
const { authenticateToken } = require('../../middlewares/authMiddleware');
const validateQuestion = require('../../middlewares/validateQuestion');

// Protect all quiz routes
router.use(authenticateToken);

// Quiz routes
router.get('/', quizController.getQuizzes);
router.post('/', quizController.createQuiz);
router.get('/:id', quizController.getQuiz);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

// Update quiz mode route
router.put('/:id/mode', quizController.updateQuizMode);

// Update quiz step route
router.put('/:id/step', quizController.updateQuizStep);

// Question routes (nested under quizzes)
router.get('/:quizId/questions', questionController.getQuizQuestions);
router.post('/:quizId/questions', 
  authenticateToken,
  validateQuestion,
  questionController.createQuestion
);
router.put('/:quizId/questions/:questionId', questionController.updateQuestion);
router.delete('/:quizId/questions/:questionId', questionController.deleteQuestion);

// Finalize quiz route
router.put('/:id/finalize', authenticateToken, quizController.finalizeQuiz);

// Start session route
router.post('/:id/start-session', authenticateToken, quizController.startSession);

module.exports = router;

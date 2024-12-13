// routes/v1/questionRoutes.js

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middlewares/authMiddleware');
const questionController = require('../../controllers/questionController');

router.post('/quizzes/:quizId/questions', authenticateToken, questionController.createQuestion);
router.get('/quizzes/:quizId/questions', authenticateToken, questionController.getQuizQuestions);

// ... other routes

module.exports = router;

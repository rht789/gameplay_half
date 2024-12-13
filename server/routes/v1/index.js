const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const quizRoutes = require('./quizRoutes');
const sessionRoutes = require('./sessionRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/quizzes', quizRoutes);
router.use('/sessions', sessionRoutes);

module.exports = router; 
const express = require('express');
const router = express.Router();
const sessionController = require('../../controllers/sessionController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

// Get session details
router.get('/:sessionId', sessionController.getSessionDetails);

// Create session
router.post('/create', sessionController.createSession);

// Join session
router.post('/join', sessionController.joinSession);

module.exports = router; 
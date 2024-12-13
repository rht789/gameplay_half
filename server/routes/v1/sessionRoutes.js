const express = require('express');
const router = express.Router();
const sessionController = require('../../controllers/sessionController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// Join session route
router.post('/join', authenticateToken, sessionController.joinSession);

// Get session details
router.get('/:sessionId', authenticateToken, sessionController.getSessionDetails);

// Approve participant
router.put('/:sessionId/participants/:participantId/approve', authenticateToken, sessionController.approveParticipant);

// Remove participant
router.delete('/:sessionId/participants/:participantId', authenticateToken, sessionController.removeParticipant);

module.exports = router; 
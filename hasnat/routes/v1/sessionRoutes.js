const express = require('express');
const { createSession, joinSession } = require('../../controllers/sessionController');
// possible error path name


const authenticateJWT = require('../../middleware/authMiddleware');
// Error path

const router = express.Router();

router.post('/create', authenticateJWT, createSession);
router.post('/join', authenticateJWT, joinSession);

module.exports = router;
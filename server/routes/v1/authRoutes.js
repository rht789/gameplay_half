const express = require('express');
const router = express.Router();
const { googleAuth } = require('../../controllers/googleAuthController');
const { login } = require('../../controllers/userController');

// Add Google auth route
router.post('/google', googleAuth);
router.post('/login', login);

module.exports = router; 
// routes/v1/topicRoutes.js

const express = require('express');
const router = express.Router();
const topicController = require('../../controllers/topicController');
const authMiddleware = require('../../middlewares/authMiddleware'); // Optional, based on your requirements

// Apply authentication middleware if needed
// router.use(authMiddleware);

// Route to get all topics
router.get('/', topicController.getAllTopics);

// Route to create a new topic (optional)
router.post('/', topicController.createTopic);

// Route to get a specific topic by ID (optional)
router.get('/:topicID', topicController.getTopicById);

// Route to update a topic (optional)
router.put('/:topicID', topicController.updateTopic);

// Route to delete a topic (optional)
router.delete('/:topicID', topicController.deleteTopic);

module.exports = router;

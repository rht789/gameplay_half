// routes/v1/subtopicRoutes.js

const express = require('express');
const router = express.Router();
const subtopicController = require('../../controllers/subtopicController');
const authMiddleware = require('../../middlewares/authMiddleware'); // Optional, based on your requirements

// Apply authentication middleware if needed
// router.use(authMiddleware);

// Route to get subtopics by topic ID
router.get('/by-topic/:topicID', subtopicController.getSubtopicsByTopicID);

// Route to create a new subtopic (optional)
router.post('/', subtopicController.createSubtopic);

// Route to get a specific subtopic by ID (optional)
router.get('/:subtopicID', subtopicController.getSubtopicById);

// Route to update a subtopic (optional)
router.put('/:subtopicID', subtopicController.updateSubtopic);

// Route to delete a subtopic (optional)
router.delete('/:subtopicID', subtopicController.deleteSubtopic);

module.exports = router;

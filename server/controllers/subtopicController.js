// controllers/subtopicController.js

const { Subtopic, Topic } = require('../models');

// Get subtopics by topic ID
exports.getSubtopicsByTopicID = async (req, res) => {
  const { topicID } = req.params;

  try {
    const topic = await Topic.findOne({ where: { topicID } });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    const subtopics = await Subtopic.findAll({ where: { topicID } });
    res.status(200).json({ success: true, subtopics });
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Create a new subtopic (optional)
exports.createSubtopic = async (req, res) => {
  const { subtopicName, topicID } = req.body;

  try {
    // Verify that the topic exists
    const topic = await Topic.findOne({ where: { topicID } });
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Invalid topic ID.' });
    }

    const newSubtopic = await Subtopic.create({ subtopicName, topicID });
    res.status(201).json({ success: true, data: newSubtopic });
  } catch (error) {
    console.error('Error creating subtopic:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Get a specific subtopic by ID (optional)
exports.getSubtopicById = async (req, res) => {
  const { subtopicID } = req.params;

  try {
    const subtopic = await Subtopic.findOne({ where: { subtopicID } });
    if (!subtopic) {
      return res.status(404).json({ success: false, message: 'Subtopic not found.' });
    }

    res.status(200).json({ success: true, data: subtopic });
  } catch (error) {
    console.error('Error fetching subtopic:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Update a subtopic (optional)
exports.updateSubtopic = async (req, res) => {
  const { subtopicID } = req.params;
  const { subtopicName, topicID } = req.body;

  try {
    const subtopic = await Subtopic.findOne({ where: { subtopicID } });
    if (!subtopic) {
      return res.status(404).json({ success: false, message: 'Subtopic not found.' });
    }

    // If topicID is being updated, verify the new topic exists
    if (topicID) {
      const topic = await Topic.findOne({ where: { topicID } });
      if (!topic) {
        return res.status(400).json({ success: false, message: 'Invalid topic ID.' });
      }
      subtopic.topicID = topicID;
    }

    subtopic.subtopicName = subtopicName || subtopic.subtopicName;
    await subtopic.save();

    res.status(200).json({ success: true, data: subtopic });
  } catch (error) {
    console.error('Error updating subtopic:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Delete a subtopic (optional)
exports.deleteSubtopic = async (req, res) => {
  const { subtopicID } = req.params;

  try {
    const subtopic = await Subtopic.findOne({ where: { subtopicID } });
    if (!subtopic) {
      return res.status(404).json({ success: false, message: 'Subtopic not found.' });
    }

    await subtopic.destroy();
    res.status(200).json({ success: true, message: 'Subtopic deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subtopic:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

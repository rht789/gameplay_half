// controllers/topicController.js

const { Topic } = require('../models');

// Get all topics
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll();
    res.status(200).json({ success: true, topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Create a new topic (optional)
exports.createTopic = async (req, res) => {
  const { topicName } = req.body;

  try {
    const newTopic = await Topic.create({ topicName });
    res.status(201).json({ success: true, data: newTopic });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Get a specific topic by ID (optional)
exports.getTopicById = async (req, res) => {
  const { topicID } = req.params;

  try {
    const topic = await Topic.findOne({ where: { topicID } });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Update a topic (optional)
exports.updateTopic = async (req, res) => {
  const { topicID } = req.params;
  const { topicName } = req.body;

  try {
    const topic = await Topic.findOne({ where: { topicID } });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    await topic.update({ topicName });
    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Delete a topic (optional)
exports.deleteTopic = async (req, res) => {
  const { topicID } = req.params;

  try {
    const topic = await Topic.findOne({ where: { topicID } });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    await topic.destroy();
    res.status(200).json({ success: true, message: 'Topic deleted successfully.' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

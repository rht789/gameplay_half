// src/services/topicService.js

import api from './api';

// Define the service functions
const getAllTopics = async () => {
  try {
    const response = await api.get('/topics');
    return response.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

const getTopicById = async (topicID) => {
  try {
    const response = await api.get(`/topics/${topicID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching topic by ID:', error);
    throw error;
  }
};

const createTopic = async (topicData) => {
  try {
    const response = await api.post('/topics', topicData);
    return response.data;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

// Assign the service functions to a named variable
const topicService = {
  getAllTopics,
  getTopicById,
  createTopic,
};

// Export the service as default
export default topicService;

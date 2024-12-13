// src/services/subtopicService.js

import api from './api';

// Define the service functions
const getSubtopicsByQuizID = async (quizID) => {
  try {
    // First, fetch the quiz to get its topicID
    const quizResponse = await api.get(`/quizzes/${quizID}`);
    if (!quizResponse.data.success) {
      return quizResponse.data;
    }

    const topicID = quizResponse.data.data.topicID;

    // Then, fetch subtopics by topicID
    const response = await api.get(`/subtopics/by-topic/${topicID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    throw error;
  }
};

const createSubtopic = async (subtopicData) => {
  try {
    const response = await api.post('/subtopics', subtopicData);
    return response.data;
  } catch (error) {
    console.error('Error creating subtopic:', error);
    throw error;
  }
};

// Assign the service functions to a named variable
const subtopicService = {
  getSubtopicsByQuizID,
  createSubtopic,
};

// Export the service as default
export default subtopicService;

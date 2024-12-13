// src/services/questionService.js

import api from './api';

const questionService = {
  createQuestion: async (quizId, questionData) => {
    try {
      const { quizId: _, ...cleanedData } = questionData;
      
      const response = await api.post(`/quizzes/${quizId}/questions`, cleanedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getQuestionById: async (questionID) => {
    const response = await api.get(`/questions/${questionID}`);
    return response.data;
  },

  findQuestionByText: async (questionText) => {
    const response = await api.get('/questions/search', {
      params: { questionText },
    });
    return response.data;
  },

  getQuizQuestions: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteQuestion: async (quizId, questionId) => {
    try {
      const response = await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateQuestion: async (quizId, questionId, questionData) => {
    try {
      const response = await api.put(`/quizzes/${quizId}/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default questionService;

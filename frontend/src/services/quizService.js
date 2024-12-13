// src/services/quizService.js

import api from './api';

export const getAllQuizzes = async () => {
  try {
    const response = await api.get('/quizzes');
    console.log('Quiz API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

const createQuiz = async (quizData) => {
  const response = await api.post('/quizzes', quizData);
  return response.data;
};

const deleteQuiz = async (quizId) => {
  const response = await api.delete(`/quizzes/${quizId}`);
  return response.data;
};

export const updateQuizMode = async (quizId, mode) => {
  try {
    const response = await api.put(`/quizzes/${quizId}/mode`, { mode });
    return response.data;
  } catch (error) {
    console.error('Error updating quiz mode:', error);
    throw error;
  }
};

export const validateQuizStep = async (quizId, step) => {
  try {
    const response = await api.put(`/quizzes/${quizId}/step`, { step });
    return response.data;
  } catch (error) {
    console.error('Error validating quiz step:', error);
    throw error;
  }
};

export const createQuestion = async (quizID, questionData) => {
  try {
    const response = await api.post(`/quizzes/${quizID}/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error.response?.data || error.message);
    throw error;
  }
};

const navigateToQuestions = (navigate, quizId) => {
  navigate(`/quizzes/${quizId}/questions`);
};

const finalizeQuiz = async (quizId) => {
  try {
    const response = await api.put(`/quizzes/${quizId}/finalize`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to finalize quiz');
    }
    return response.data;
  } catch (error) {
    console.error('Error in finalizeQuiz:', error);
    throw error;
  }
};

const getQuiz = async (quizId) => {
  try {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};

const startQuizSession = async (quizId) => {
  try {
    const response = await api.post(`/quizzes/${quizId}/start-session`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const quizService = {
  getAllQuizzes,
  createQuiz,
  deleteQuiz,
  updateQuizMode,
  validateQuizStep,
  createQuestion,
  navigateToQuestions,
  finalizeQuiz,
  getQuiz,
  startQuizSession,
  // ... other methods
};

export default quizService;

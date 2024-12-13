import React, { createContext, useContext, useState, useCallback } from 'react';
import quizService from '../services/quizService'; // Assuming you have this service

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await quizService.getQuizzes();
      setQuizzes(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuiz = useCallback(async (quizData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await quizService.createQuiz(quizData);
      setQuizzes(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuiz = useCallback(async (quizId, quizData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await quizService.updateQuiz(quizId, quizData);
      setQuizzes(prev => prev.map(quiz => 
        quiz.id === quizId ? response.data : quiz
      ));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuiz = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      await quizService.deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    quizzes,
    currentQuiz,
    loading,
    error,
    setCurrentQuiz,
    fetchQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}; 
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  const createSession = async (quizId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/sessions/create`,
        { quizId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCurrentSession(response.data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionCode) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/sessions/join`,
        { sessionCode },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCurrentSession(response.data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentSession,
    participants,
    loading,
    createSession,
    joinSession,
    setParticipants
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}; 
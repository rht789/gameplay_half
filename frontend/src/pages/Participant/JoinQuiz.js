import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './styles/JoinQuiz.css';

const JoinQuiz = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/sessions/join`,
        { sessionCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Successfully joined session');
        navigate(`/waiting-room/${response.data.data.sessionId}`);
      }
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error(error.response?.data?.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-quiz-container">
      <div className="join-quiz-card">
        <h2>Join a Quiz</h2>
        <p>Enter the session code provided by your quiz host</p>
        <form onSubmit={handleSubmit}>
          <div className="code-input-container">
            <input
              type="text"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="code-input"
              required
            />
          </div>
          <button 
            type="submit" 
            className="join-button"
            disabled={loading || sessionCode.length !== 6}
          >
            {loading ? 'Joining...' : 'Join Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinQuiz; 
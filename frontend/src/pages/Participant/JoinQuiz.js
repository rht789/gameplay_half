import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
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
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Please log in to join a quiz');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/sessions/join`,
        { sessionCode },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        navigate(`/waiting-room/${response.data.data.sessionId}`);
      }
    } catch (error) {
      console.error('Join quiz error:', error);
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error('Please log in again to join the quiz');
            navigate('/login');
            break;
          case 404:
            toast.error('Invalid session code or session has expired');
            break;
          case 400:
            toast.error(error.response.data.message || 'Session is full');
            break;
          default:
            toast.error('Failed to join quiz. Please try again.');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
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
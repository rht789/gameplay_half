import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/QuizCard.css';

const QuizCard = ({ quiz, onDelete, onEdit }) => {
  const navigate = useNavigate();
  
  const handleStart = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/quizzes/${quiz.quizID}/start-session`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        navigate(`/host-control/${response.data.data.sessionId}`, {
          state: {
            sessionCode: response.data.data.sessionCode,
            quizName: quiz.quizName
          }
        });
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      // Handle error (show toast/alert)
    }
  };

  const renderButtons = () => {
    if (quiz.status === 'ready') {
      return (
        <>
          <button 
            className="start-button"
            onClick={handleStart}
          >
            Start Quiz
          </button>
        </>
      );
    }
    return (
      <>
        <button onClick={() => onEdit(quiz.quizID)}>Edit</button>
        <button onClick={() => onDelete(quiz.quizID)}>Delete</button>
        <button onClick={() => navigate(`/quiz/${quiz.quizID}/questions`)}>
          Questions
        </button>
        <button 
          className="finalize-button"
          onClick={() => navigate(`/quiz/${quiz.quizID}/finalize`)}
        >
          Finalize
        </button>
      </>
    );
  };

  return (
    <div className="quiz-card">
      <div className="quiz-header">
        <h3>{quiz.quizName}</h3>
        <span className={`status-badge ${quiz.status}`}>
          {quiz.status === 'ready' ? 'Ready' : 'Draft'}
        </span>
      </div>
      <p>{quiz.description}</p>
      <div className="quiz-info">
        <span>{quiz.maxParticipants} participants</span>
        <span>{new Date(quiz.startAt).toLocaleString()}</span>
        <span>{quiz.questionMode}</span>
      </div>
      <div className="quiz-actions">
        {renderButtons()}
      </div>
    </div>
  );
};

export default QuizCard; 
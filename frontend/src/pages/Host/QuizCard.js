import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { toast } from 'react-hot-toast';
import '../styles/QuizCard.css';

const QuizCard = ({ quiz, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const [showLifetimeDialog, setShowLifetimeDialog] = useState(false);
  const [sessionLifetime, setSessionLifetime] = useState(24);
  
  const handleStart = async () => {
    setShowLifetimeDialog(true);
  };

  const handleStartSession = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/quizzes/${quiz.quizID}/start-session`,
        { sessionLifetime },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        if (response.data.data.isExisting) {
          toast.success('Redirecting to active session...');
        }
        navigate(`/host-control/${response.data.data.sessionId}`);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start session');
    } finally {
      setShowLifetimeDialog(false);
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
    <>
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

      {/* Session Lifetime Dialog */}
      <Dialog 
        open={showLifetimeDialog} 
        onClose={() => setShowLifetimeDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Set Session Duration</DialogTitle>
        <DialogContent>
          <div className="lifetime-dialog-content">
            <p>How long should this session remain active?</p>
            <TextField
              autoFocus
              margin="dense"
              label="Duration (hours)"
              type="number"
              fullWidth
              value={sessionLifetime}
              onChange={(e) => setSessionLifetime(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 72 }}
              helperText="Session can be active between 1 and 72 hours"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLifetimeDialog(false)}>Cancel</Button>
          <Button onClick={handleStartSession} color="primary" variant="contained">
            Start Session
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuizCard; 
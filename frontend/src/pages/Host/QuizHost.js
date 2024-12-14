import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
import socketService from '../../services/socketService';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Chip,
  Dialog,
  DialogContent,
  CircularProgress
} from '@mui/material';
import { Clock, Users } from 'react-feather';
import { toast } from 'react-hot-toast';
import './styles/QuizHost.css';

const QuizHost = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { participants } = useSession();
  const [socket, setSocket] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [scores, setScores] = useState([]);
  const [showScores, setShowScores] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        console.log('Initializing socket connection...');
        const socketInstance = socketService.connect();
        
        if (socketInstance) {
          setSocket(socketInstance);
          
          // Join the session room
          socketInstance.emit('join-session', { sessionId });
          console.log('Joined session:', sessionId);

          // Listen for next question
          socketInstance.on('next-question', (questionData) => {
            console.log('Received question data:', questionData);
            setCurrentQuestion(questionData);
            setQuestionNumber(questionData.questionNumber);
            setTotalQuestions(questionData.totalQuestions);
            setTimeLeft(questionData.timeLimit);
            setShowScores(false);
            setIsLoading(false);
          });

          // Listen for question end
          socketInstance.on('question-end', (data) => {
            console.log('Question ended:', data);
            setShowScores(true);
            setScores(data.scores);
          });

          // Listen for game end
          socketInstance.on('game-end', (data) => {
            console.log('Game ended:', data);
            setShowScores(true);
            setScores(data.finalScores);
            setCurrentQuestion(null);
            toast.success('Quiz completed!');
          });

          // Listen for errors
          socketInstance.on('error', (error) => {
            console.error('Socket error:', error);
            toast.error(error.message);
          });

          // Listen for disconnect
          socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            toast.error('Lost connection to server');
          });
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
        toast.error('Failed to connect to game server');
      }
    };

    initializeSocket();

    return () => {
      if (socket) {
        console.log('Cleaning up socket connection...');
        socket.disconnect();
      }
    };
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0) return;

    console.log('Starting timer with', timeLeft, 'seconds');
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        console.log('Time remaining:', newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, timeLeft]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Preparing quiz session...</Typography>
      </Box>
    );
  }

  // Calculate progress
  const progress = currentQuestion 
    ? ((currentQuestion.timeLimit - timeLeft) / currentQuestion.timeLimit) * 100 
    : 0;

  return (
    <Box className="quiz-host-container">
      {currentQuestion ? (
        <Paper elevation={3} className="question-display">
          {/* Header */}
          <Box className="question-header">
            <Typography variant="h6">
              Question {questionNumber}/{totalQuestions}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Chip
                icon={<Clock size={16} />}
                label={`${timeLeft}s`}
                color={timeLeft < 10 ? "warning" : "default"}
              />
              <Chip
                icon={<Users size={16} />}
                label={`${participants.length} Participants`}
              />
            </Box>
          </Box>

          {/* Timer Progress */}
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            className={timeLeft < 10 ? 'timer-warning' : ''}
          />

          {/* Question Content */}
          <Box className="question-content">
            <Typography variant="h5" gutterBottom>
              {currentQuestion.questionText}
            </Typography>

            {/* Options */}
            <Grid container spacing={2} className="options-grid">
              {currentQuestion.options?.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper className="option-item" elevation={1}>
                    <Typography>{option.optionText}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      ) : (
        <Paper className="waiting-display">
          <Typography variant="h5">
            {scores.length > 0 ? 'Quiz Completed!' : 'Preparing Quiz...'}
          </Typography>
        </Paper>
      )}

      {/* Scores Dialog */}
      <Dialog 
        open={showScores} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Current Standings
          </Typography>
          {scores.map((score, index) => {
            const participant = participants.find(p => p.id === score.participantId);
            return (
              <Box key={score.participantId} className="score-item">
                <Typography>
                  {index + 1}. {participant?.username || 'Unknown'}
                </Typography>
                <Typography>
                  Score: {score.score} ({score.correctAnswers} correct)
                </Typography>
              </Box>
            );
          })}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default QuizHost; 
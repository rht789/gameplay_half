import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Dialog,
  DialogContent,
  Chip,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { Clock } from 'react-feather';
import { toast } from 'react-hot-toast';
import './styles/QuizParticipant.css';

const QuizParticipant = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        console.log('Initializing participant socket connection...');
        const socketInstance = socketService.connect();
        
        if (socketInstance) {
          setSocket(socketInstance);
          
          // Join the session
          socketInstance.emit('join-session', { sessionId });
          console.log('Participant joined session:', sessionId);

          // Listen for next question
          socketInstance.on('next-question', (questionData) => {
            console.log('Participant received question:', questionData);
            setCurrentQuestion(questionData);
            setQuestionNumber(questionData.questionNumber);
            setTotalQuestions(questionData.totalQuestions);
            setTimeLeft(questionData.timeLimit);
            setSelectedAnswer('');
            setHasSubmitted(false);
            setShowResults(false);
            setIsConnecting(false);
          });

          // Listen for question end
          socketInstance.on('question-end', (data) => {
            console.log('Question ended:', data);
            setShowResults(true);
            setResults(data);
          });

          // Listen for game end
          socketInstance.on('game-end', (data) => {
            console.log('Game ended:', data);
            setShowResults(true);
            setResults({ ...data, isGameEnd: true });
            setCurrentQuestion(null);
            toast.success('Quiz completed!');
          });

          // Listen for errors
          socketInstance.on('error', (error) => {
            console.error('Participant socket error:', error);
            toast.error(error.message);
          });

          // Listen for disconnect
          socketInstance.on('disconnect', () => {
            console.log('Participant disconnected from session');
            setIsConnecting(true);
            toast.error('Lost connection to game server');
          });

          // Listen for reconnect
          socketInstance.on('reconnect', () => {
            console.log('Participant reconnected to session');
            socketInstance.emit('join-session', { sessionId });
          });
        }
      } catch (error) {
        console.error('Participant socket initialization error:', error);
        toast.error('Failed to connect to game server');
      }
    };

    initializeSocket();

    return () => {
      if (socket) {
        console.log('Cleaning up participant socket connection');
        socket.disconnect();
      }
    };
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0 || hasSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1 && !hasSubmitted) {
          handleSubmit(); // Auto-submit when time runs out
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, timeLeft, hasSubmitted]);

  const handleSubmit = () => {
    if (!socket || hasSubmitted || !selectedAnswer) return;

    socket.emit('submit-answer', {
      sessionId,
      answer: selectedAnswer
    });

    setHasSubmitted(true);
    toast.success('Answer submitted!');
  };

  // Calculate progress
  const progress = currentQuestion 
    ? ((currentQuestion.timeLimit - timeLeft) / currentQuestion.timeLimit) * 100 
    : 0;

  const renderAnswerInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'MCQ':
        return (
          <FormControl component="fieldset" className="options-container">
            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => !hasSubmitted && setSelectedAnswer(e.target.value)}
            >
              {currentQuestion.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option.optionText}
                  control={<Radio />}
                  label={option.optionText}
                  disabled={hasSubmitted}
                  className={`option ${hasSubmitted ? 'submitted' : ''}`}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'TRUE_FALSE':
        return (
          <ToggleButtonGroup
            value={selectedAnswer}
            exclusive
            onChange={(e, value) => !hasSubmitted && setSelectedAnswer(value)}
            className="true-false-container"
            disabled={hasSubmitted}
          >
            <ToggleButton value="true" className="true-false-button">
              True
            </ToggleButton>
            <ToggleButton value="false" className="true-false-button">
              False
            </ToggleButton>
          </ToggleButtonGroup>
        );

      case 'SHORT_ANSWER':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Type your answer here..."
            value={selectedAnswer}
            onChange={(e) => !hasSubmitted && setSelectedAnswer(e.target.value)}
            disabled={hasSubmitted}
            className="short-answer-input"
          />
        );

      case 'FILL_IN_THE_BLANKS':
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Fill in the blank..."
            value={selectedAnswer}
            onChange={(e) => !hasSubmitted && setSelectedAnswer(e.target.value)}
            disabled={hasSubmitted}
            className="fill-blanks-input"
          />
        );

      default:
        return null;
    }
  };

  if (isConnecting) {
    return (
      <Box className="quiz-participant-container">
        <Paper className="waiting-display">
          <Typography variant="h5">
            Connecting to game server...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!currentQuestion && !showResults) {
    return (
      <Box className="quiz-participant-container">
        <Paper className="waiting-display">
          <Typography variant="h5">
            Waiting for quiz to start...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="quiz-participant-container">
      {currentQuestion && (
        <Paper elevation={3} className="question-display">
          {/* Header */}
          <Box className="question-header">
            <Typography variant="h6">
              Question {questionNumber}/{totalQuestions}
            </Typography>
            <Chip
              icon={<Clock size={16} />}
              label={`${timeLeft}s`}
              color={timeLeft < 10 ? "warning" : "default"}
            />
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

            {/* Dynamic Answer Input */}
            {renderAnswerInput()}

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!selectedAnswer || hasSubmitted}
              fullWidth
              className="submit-button"
            >
              {hasSubmitted ? 'Answer Submitted' : 'Submit Answer'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Results Dialog */}
      <Dialog 
        open={showResults} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogContent>
          {results?.isGameEnd ? (
            <>
              <Typography variant="h6" gutterBottom>
                Quiz Completed!
              </Typography>
              <Typography variant="body1" gutterBottom>
                Final Standings:
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Question Results
              </Typography>
              <Typography variant="body1" gutterBottom>
                Correct Answer: {results?.correctAnswer}
              </Typography>
            </>
          )}
          {results?.scores?.map((score, index) => (
            <Box key={score.participantId} className="score-item">
              <Typography>
                {index + 1}. Player {score.participantId}
              </Typography>
              <Typography>
                Score: {score.score} ({score.correctAnswers} correct)
              </Typography>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default QuizParticipant; 
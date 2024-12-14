import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip
} from '@mui/material';
import { Clock } from 'react-feather';
import './styles/QuestionDisplay.css';

const QuestionDisplay = ({ 
  question, 
  timeLimit, 
  onSubmit, 
  isHost = false,
  questionNumber,
  totalQuestions 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || hasSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, hasSubmitted]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && !hasSubmitted && !isHost) {
      handleSubmit();
    }
  }, [timeRemaining, hasSubmitted, isHost]);

  const handleSubmit = () => {
    if (!hasSubmitted && !isHost) {
      setHasSubmitted(true);
      onSubmit(selectedAnswer);
    }
  };

  const progressValue = (timeRemaining / timeLimit) * 100;

  return (
    <Box className="question-display">
      <Paper elevation={3} className="question-container">
        {/* Question Header */}
        <Box className="question-header">
          <Typography variant="h6" className="question-counter">
            Question {questionNumber} of {totalQuestions}
          </Typography>
          <Box className="timer-container">
            <Clock size={20} />
            <Typography variant="h6">
              {timeRemaining}s
            </Typography>
          </Box>
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={progressValue}
          className={`timer-progress ${progressValue < 30 ? 'warning' : ''}`}
        />

        {/* Question Content */}
        <Box className="question-content">
          <Typography variant="h5" gutterBottom>
            {question.questionText}
          </Typography>

          {/* Options */}
          <FormControl component="fieldset" className="options-container">
            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => !hasSubmitted && setSelectedAnswer(e.target.value)}
            >
              {question.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option.optionText}
                  control={<Radio />}
                  label={option.optionText}
                  disabled={hasSubmitted || isHost}
                  className={`option ${hasSubmitted ? 'submitted' : ''}`}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Action Button */}
        {!isHost && (
          <Box className="action-container">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!selectedAnswer || hasSubmitted}
              fullWidth
            >
              {hasSubmitted ? 'Answer Submitted' : 'Submit Answer'}
            </Button>
          </Box>
        )}

        {/* Host View */}
        {isHost && (
          <Box className="host-info">
            <Chip 
              label={`Time Remaining: ${timeRemaining}s`}
              color={timeRemaining < 10 ? 'warning' : 'default'}
            />
            <Typography variant="body2" color="textSecondary">
              Waiting for participants to answer...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default QuestionDisplay; 
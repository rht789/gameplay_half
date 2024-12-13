// src/pages/Questions/CreateQuestion.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionService from '../../services/questionService';
import quizService from '../../services/quizService';
import { toast } from 'react-toastify';
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Box,
  Switch,
  IconButton,
  Slider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  BarChart as DifficultyIcon,
  Add as PlusIcon,
  Remove as MinusIcon,
} from '@mui/icons-material';
import './CreateQuestion.css';

const CreateQuestion = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MCQ',
    options: [],
    difficulty: 'medium',
    timeLimit: 30,
    correctAns: ''
  });
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add validation for quizId
  useEffect(() => {
    if (!quizId) {
      toast.error('Quiz ID is missing');
      navigate('/quizzes');
    }
  }, [quizId, navigate]);

  // Add this at the beginning of your component
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuiz(quizId);
        if (response.success) {
          setQuiz(response.data);
        } else {
          toast.error('Failed to fetch quiz details');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Error loading quiz details');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  // Handle question type change
  const handleTypeChange = (event) => {
    const type = event.target.value;
    let newOptions = [];

    switch (type) {
      case 'MCQ':
        newOptions = [
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false }
        ];
        break;
      case 'TRUE_FALSE':
        newOptions = [
          { id: '1', text: 'True', isCorrect: true },
          { id: '2', text: 'False', isCorrect: false }
        ];
        break;
      case 'FILL_IN_THE_BLANKS':
      case 'SHORT_ANSWER':
        newOptions = [
          { id: '1', text: '', isCorrect: true } // Single option for correct answer
        ];
        break;
      default:
        newOptions = [];
    }

    setFormData({
      ...formData,
      questionType: type,
      options: newOptions,
    });
  };

  // Handle question text change
  const handleQuestionTextChange = (event) => {
    setFormData({
      ...formData,
      questionText: event.target.value,
    });
    // Clear error when user starts typing
    if (errors.questionText) {
      setErrors({ ...errors, questionText: null });
    }
  };

  // Handle option text change
  const handleOptionChange = (index, value) => {
    if (formData.questionType === 'TRUE_FALSE') {
      return; // Don't allow editing TRUE_FALSE options
    }

    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setFormData({ ...formData, options: newOptions });
  };

  // Handle correct answer toggle
  const handleCorrectToggle = (id) => {
    setFormData({
      ...formData,
      options: formData.options.map(option =>
        option.id === id ? { ...option, isCorrect: !option.isCorrect } : option
      ),
    });
  };

  // Add new option
  const addOption = () => {
    if (formData.questionType === 'TRUE_FALSE') {
      return; // Don't allow adding options for TRUE_FALSE
    }
    
    const newId = String(formData.options.length + 1);
    setFormData({
      ...formData,
      options: [...formData.options, { id: newId, text: '', isCorrect: false }],
    });
  };

  // Remove option
  const removeOption = (id) => {
    setFormData({
      ...formData,
      options: formData.options.filter(option => option.id !== id),
    });
  };

  // Handle time limit change
  const handleTimeChange = (event, newValue) => {
    setFormData({
      ...formData,
      timeLimit: newValue,
    });
  };

  // Handle difficulty change
  const handleDifficultyChange = (event) => {
    setFormData({
      ...formData,
      difficulty: event.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (quiz?.status === 'ready') {
      toast.error('Cannot add questions to a finalized quiz');
      return;
    }

    // Validation checks
    if (formData.questionType === 'MCQ' || formData.questionType === 'TRUE_FALSE') {
      const correctCount = formData.options.filter(opt => opt.isCorrect).length;
      if (correctCount !== 1) {
        toast.error(`Please select exactly one correct answer for ${formData.questionType === 'MCQ' ? 'MCQ' : 'True/False'} questions`);
        return;
      }
    }

    try {
      const response = await questionService.createQuestion(quizId, formData);
      if (response.success) {
        toast.success('Question created successfully');
        // Reset form or handle success
      }
    } catch (error) {
      toast.error(error.message || 'Error creating question');
    }
  };

  // Add this function to handle correct answer selection
  const handleCorrectAnswerChange = (index) => {
    const newOptions = formData.options.map((option, idx) => {
      // For both MCQ and TRUE_FALSE, only allow one correct answer
      if (formData.questionType === 'MCQ' || formData.questionType === 'TRUE_FALSE') {
        return {
          ...option,
          isCorrect: idx === index // Only the clicked option will be true
        };
      }
      return option;
    });

    setFormData({ ...formData, options: newOptions });
  };

  // Update your option rendering to include correct answer selection
  const renderOptions = () => {
    if (formData.questionType === 'TRUE_FALSE') {
      return (
        <div className="true-false-options">
          {formData.options.map((option, index) => (
            <FormControlLabel
              key={index}
              control={
                <Radio
                  checked={option.isCorrect}
                  onChange={() => handleCorrectAnswerChange(index)}
                  sx={{
                    '&.Mui-checked': {
                      color: '#7556f0',
                    },
                  }}
                />
              }
              label={option.text}
            />
          ))}
        </div>
      );
    }

    return formData.options.map((option, index) => (
      <div key={index} className="option-row">
        <TextField
          value={option.text}
          onChange={(e) => handleOptionChange(index, e.target.value)}
          placeholder={`Option ${index + 1}`}
          fullWidth
        />
        <FormControlLabel
          control={
            <Radio
              checked={option.isCorrect}
              onChange={() => handleCorrectAnswerChange(index)}
              sx={{
                '&.Mui-checked': {
                  color: '#7556f0',
                },
              }}
            />
          }
          label="Correct"
        />
      </div>
    ));
  };

  // Add this handler function near your other handlers
  const handleShowQuestions = () => {
    navigate(`/quizzes/${quizId}/questions`);
  };

  if (loading) {
    return <div className="loading">Loading quiz details...</div>;
  }

  if (quiz?.status === 'ready') {
    return (
      <div className="create-question-container">
        <div className="question-card">
          <Alert severity="info" sx={{ mb: 2 }}>
            This quiz has been finalized. Questions cannot be added or modified.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/quizzes')}
            sx={{
              backgroundColor: '#7556f0',
              '&:hover': {
                backgroundColor: '#6d40e7',
              },
            }}
          >
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-question-container">
      <div className="question-card">
        <Typography variant="h5" className="card-title">
          Create a New Question
        </Typography>

        <form>
          {/* Question Type Selection */}
          <div className="form-field">
            <InputLabel className="field-label">
              Question Type
            </InputLabel>
            <FormControl fullWidth>
              <Select
                value={formData.questionType}
                onChange={handleTypeChange}
                className="custom-input"
              >
                <MenuItem value="MCQ">Multiple Choice</MenuItem>
                <MenuItem value="TRUE_FALSE">True/False</MenuItem>
                <MenuItem value="FILL_IN_THE_BLANKS">Fill in the Blanks</MenuItem>
                <MenuItem value="SHORT_ANSWER">Short Answer</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Question Text Input */}
          <div className="form-field">
            <InputLabel className="field-label">
              Question Text
            </InputLabel>
            <TextField
              multiline
              rows={3}
              value={formData.questionText}
              onChange={handleQuestionTextChange}
              placeholder="Enter your question here"
              className="custom-input"
              error={!!errors.questionText}
              helperText={errors.questionText}
              fullWidth
            />
          </div>

          {/* Options Section */}
          {(formData.questionType === 'MCQ' || formData.questionType === 'TRUE_FALSE') && (
            <div className="form-field">
              <InputLabel className="field-label">
                Answer Options
              </InputLabel>
              
              <div className="options-container">
                {renderOptions()}

                {/* Add Option Button (only for MCQ) */}
                {formData.questionType === 'MCQ' && (
                  <Button
                    onClick={addOption}
                    startIcon={<PlusIcon />}
                    className="add-option-btn"
                    fullWidth
                  >
                    Add Option
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Correct Answer Input for Fill in the Blanks and Short Answer */}
          {(formData.questionType === 'FILL_IN_THE_BLANKS' || formData.questionType === 'SHORT_ANSWER') && (
            <div className="form-field">
              <InputLabel className="field-label">
                Correct Answer
              </InputLabel>
              <TextField
                value={formData.correctAns}
                onChange={(e) => setFormData({ ...formData, correctAns: e.target.value })}
                placeholder="Enter the correct answer"
                className="custom-input"
                fullWidth
              />
            </div>
          )}

          {/* Time Limit Section */}
          <div className="form-field">
            <div className="field-label">
              <ClockIcon fontSize="small" sx={{ color: '#412191' }} />
              <InputLabel>Time Limit (seconds)</InputLabel>
            </div>
            <div className="slider-container">
              <Slider
                value={formData.timeLimit}
                onChange={handleTimeChange}
                min={5}
                max={120}
                step={5}
                sx={{
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#7556f0',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#7556f0',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#ebeafd',
                  },
                }}
              />
              <Typography className="time-display">
                {formData.timeLimit}s
              </Typography>
            </div>
          </div>

          {/* Difficulty Level Section */}
          <div className="form-field">
            <div className="field-label">
              <DifficultyIcon fontSize="small" sx={{ color: '#412191' }} />
              <InputLabel>Difficulty Level</InputLabel>
            </div>
            <RadioGroup
              row
              value={formData.difficulty}
              onChange={handleDifficultyChange}
              className="radio-group"
            >
              <FormControlLabel
                value="easy"
                control={
                  <Radio 
                    sx={{
                      '&.Mui-checked': {
                        color: '#7556f0',
                      },
                    }}
                  />
                }
                label="Easy"
                className="radio-label"
              />
              <FormControlLabel
                value="medium"
                control={
                  <Radio 
                    sx={{
                      '&.Mui-checked': {
                        color: '#7556f0',
                      },
                    }}
                  />
                }
                label="Medium"
                className="radio-label"
              />
              <FormControlLabel
                value="hard"
                control={
                  <Radio 
                    sx={{
                      '&.Mui-checked': {
                        color: '#7556f0',
                      },
                    }}
                  />
                }
                label="Hard"
                className="radio-label"
              />
            </RadioGroup>
          </div>

          {/* Save and Show Questions Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              fullWidth
              className="save-question-btn"
              onClick={handleSubmit}
              sx={{
                backgroundColor: '#7556f0',
                '&:hover': {
                  backgroundColor: '#6d40e7',
                },
              }}
              disabled={quiz?.status === 'ready'}
            >
              Save Question
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={handleShowQuestions}
              sx={{
                borderColor: '#7556f0',
                color: '#7556f0',
                '&:hover': {
                  borderColor: '#6d40e7',
                  backgroundColor: 'rgba(117, 86, 240, 0.04)',
                },
              }}
              disabled={quiz?.status === 'ready'}
            >
              Show Questions
            </Button>
          </Box>
        </form>
      </div>

      {/* Saved Questions Section */}
      {savedQuestions.length > 0 && (
        <div className="question-card saved-questions">
          <Typography variant="h6" className="card-title">
            Saved Questions ({savedQuestions.length})
          </Typography>
          
          {savedQuestions.map((question, index) => (
            <Card 
              key={question.id} 
              className="saved-question-card"
              sx={{ mb: 2, border: '1px solid #e3e3e3' }}
            >
              <CardContent>
                <div className="question-header">
                  <div>
                    <Typography 
                      variant="body2" 
                      sx={{ color: '#412191', mb: 1 }}
                    >
                      Question {index + 1}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ color: '#271362', fontWeight: 500 }}
                    >
                      {question.questionText}
                    </Typography>
                  </div>
                  <div className="question-badges">
                    <Chip 
                      label={question.questionType}
                      sx={{
                        backgroundColor: '#ebeafd',
                        color: '#412191',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip 
                      label={`${question.timeLimit}s`}
                      sx={{
                        backgroundColor: '#ebeafd',
                        color: '#412191',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip 
                      label={question.difficulty}
                      sx={{
                        backgroundColor: '#ebeafd',
                        color: '#412191',
                        fontSize: '0.75rem'
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateQuestion;

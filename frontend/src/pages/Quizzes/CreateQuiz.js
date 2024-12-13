// src/pages/Quizzes/CreateQuiz.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { 
  Users, 
  Eye, 
  Book, 
  AlignLeft, 
  PenLine,
  Calendar as CalendarIcon 
} from 'lucide-react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Box,
  InputLabel,
  InputAdornment
} from '@mui/material';
import './CreateQuiz.css';

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    quizName: '',
    topicName: '',
    description: '',
    visibility: 'public',
    maxParticipants: '',
    startAt: '',
    startTime: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dateTime = formData.startAt && formData.startTime 
        ? `${formData.startAt}T${formData.startTime}`
        : null;
        
      const quizData = {
        ...formData,
        startAt: dateTime
      };

      const response = await quizService.createQuiz(quizData);
      if (response.success) {
        toast.success('Quiz created successfully');
        navigate(`/quizzes/${response.data.quizID}/mode-selection`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <Card className="create-quiz-card">
      <CardHeader
        title={
          <Typography variant="h4" className="card-title">
            Create a New Quiz
          </Typography>
        }
      />
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="quiz-form">
          <Box className="form-field">
            <div className="label-container">
              <PenLine size={18} />
              <span className="label-text">Quiz Name</span>
            </div>
            <TextField
              fullWidth
              name="quizName"
              placeholder="Enter quiz name"
              value={formData.quizName}
              onChange={handleChange}
              variant="outlined"
              className="custom-input"
            />
          </Box>

          <Box className="form-field">
            <div className="label-container">
              <Book size={18} />
              <span className="label-text">Topic Name</span>
            </div>
            <TextField
              fullWidth
              name="topicName"
              placeholder="Enter topic name"
              value={formData.topicName}
              onChange={handleChange}
              variant="outlined"
              className="custom-input"
            />
          </Box>

          <Box className="form-field">
            <div className="label-container">
              <AlignLeft size={18} />
              <span className="label-text">Description</span>
            </div>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              placeholder="Enter quiz description"
              value={formData.description}
              onChange={handleChange}
              variant="outlined"
              className="custom-input"
            />
          </Box>

          {/* Visibility */}
          <Box className="form-field">
            <div className="label-container">
              <Eye size={18} />
              <span className="label-text">Visibility</span>
            </div>
            <RadioGroup
              row
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="radio-group"
            >
              <FormControlLabel 
                value="public" 
                control={<Radio className="custom-radio" />} 
                label={<span className="radio-label">Public</span>}
              />
              <FormControlLabel 
                value="private" 
                control={<Radio className="custom-radio" />} 
                label={<span className="radio-label">Private</span>}
              />
            </RadioGroup>
          </Box>

          {/* Max Participants */}
          <Box className="form-field">
            <div className="label-container">
              <Users size={18} />
              <span className="label-text">Max Participants</span>
            </div>
            <TextField
              fullWidth
              type="number"
              name="maxParticipants"
              placeholder="Enter max participants"
              value={formData.maxParticipants}
              onChange={handleChange}
              variant="outlined"
              className="custom-input"
            />
          </Box>

          {/* Start Date and Time */}
          <Box className="form-field">
            <div className="label-container">
              <CalendarIcon size={18} />
              <span className="label-text">Start Date and Time</span>
            </div>
            <div className="date-time-container">
              <TextField
                type="date"
                name="startAt"
                value={formData.startAt}
                onChange={handleChange}
                className="custom-input date-input"
                InputProps={{
                  className: "date-input-field"
                }}
              />
              <TextField
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="custom-input time-input"
                InputProps={{
                  className: "time-input-field"
                }}
              />
            </div>
          </Box>

          <CardActions className="card-actions">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Create Quiz
            </Button>
          </CardActions>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateQuiz;

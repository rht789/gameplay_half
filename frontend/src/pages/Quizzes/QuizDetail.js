// src/pages/Quizzes/QuizDetail.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import quizService from '../../services/quizService';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const QuizDetail = () => {
  const { quizID } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);

  const fetchQuizDetails = async () => {
    setIsLoading(true);
    try {
      const data = await quizService.getQuizById(quizID);
      setQuiz(data.quiz);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch quiz details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizID]);

  const handleAddQuestion = () => {
    // Navigate to the CreateQuestion component, passing the quizID
    navigate(`/quizzes/${quizID}/add-question`);
  };

  const handleFinalize = async () => {
    try {
      await quizService.finalizeQuiz(quizID);
      toast.success('Quiz finalized successfully');
      fetchQuizDetails(); // Refresh quiz data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to finalize quiz');
    }
    setOpenFinalizeDialog(false);
  };

  if (isLoading) {
    return (
      <Container>
        <Typography variant="h5">Loading...</Typography>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container>
        <Typography variant="h5">Quiz not found.</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {quiz.quizName}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {quiz.description}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Max Participants: {quiz.maxParticipants}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visibility: {quiz.isPublic ? 'Public' : 'Private'}
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Questions</Typography>
        <List>
          {quiz.questions && quiz.questions.length > 0 ? (
            quiz.questions.map((question) => (
              <ListItem key={question.questionID}>
                <ListItemText
                  primary={question.questionText}
                  secondary={`Type: ${question.questionType}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">No questions added yet.</Typography>
          )}
        </List>
        <Button variant="contained" color="primary" onClick={handleAddQuestion}>
          Add Question
        </Button>
      </Box>

      {quiz?.status !== 'ready' && (
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setOpenFinalizeDialog(true)}
            disabled={!quiz?.questions?.length}
          >
            Finalize Quiz
          </Button>
        </Box>
      )}

      <Dialog open={openFinalizeDialog} onClose={() => setOpenFinalizeDialog(false)}>
        <DialogTitle>Finalize Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to finalize this quiz? You won't be able to modify it after finalization.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinalizeDialog(false)}>Cancel</Button>
          <Button onClick={handleFinalize} color="primary">
            Finalize
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizDetail;

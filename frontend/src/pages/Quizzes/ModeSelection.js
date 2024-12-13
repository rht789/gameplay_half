import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import { toast } from 'react-toastify';
import quizService from '../../services/quizService';

const ModeSelection = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const handleModeSelect = async (mode) => {
    try {
      if (!quizId) {
        toast.error('Quiz ID is missing');
        return;
      }

      console.log('Updating quiz mode for quiz:', quizId, 'with mode:', mode);
      
      const modeResponse = await quizService.updateQuizMode(quizId, mode);
      if (!modeResponse.success) {
        throw new Error(modeResponse.message || 'Failed to update quiz mode');
      }

      const stepResponse = await quizService.validateQuizStep(quizId, 'mode_selected');
      if (!stepResponse.success) {
        throw new Error(stepResponse.message || 'Failed to update quiz step');
      }

      if (mode === 'manual') {
        navigate(`/quizzes/${quizId}/create-question`);
      } else if (mode === 'ai') {
        navigate(`/quizzes/${quizId}/ai-generation`);
      }
    } catch (error) {
      console.error('Error in handleModeSelect:', error);
      toast.error(error.message || 'Failed to set quiz mode');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 15 }}>
      <Typography variant="h4" gutterBottom align="center">
        Select Question Creation Mode
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            console.log('Manual button clicked for quiz:', quizId);
            handleModeSelect('manual');
          }}
          sx={{ 
            py: 3, 
            backgroundColor: '#7556f0', 
            '&:hover': { backgroundColor: '#6d40e7' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Manual Question Creation
        </Button>
        
        <Button
          variant="contained"
          size="large"
          onClick={() => handleModeSelect('ai')}
          sx={{ 
            py: 3, 
            backgroundColor: '#7556f0', 
            '&:hover': { backgroundColor: '#6d40e7' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          AI-Generated Questions
        </Button>
      </Box>
    </Container>
  );
};

export default ModeSelection;
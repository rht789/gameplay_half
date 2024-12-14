import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
import socketService from '../../services/socketService';
import { Clock, Users } from 'react-feather';
import { toast } from 'react-hot-toast';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import './styles/WaitingRoom.css';
import axios from 'axios';

const WaitingRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { setParticipants } = useSession();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('waiting');
  const [sessionDetails, setSessionDetails] = useState({
    sessionCode: '',
    quizName: '',
    participants: [],
    expiresAt: null
  });
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const initializeSocket = useCallback(async () => {
    try {
      console.log('Initializing socket connection...');
      const socketInstance = socketService.connect();
      
      if (socketInstance) {
        setSocket(socketInstance);
        setIsConnecting(false);
        
        socketInstance.emit('join-waiting-room', { sessionId });

        // Update status handling
        socketInstance.on('participant-status-changed', ({ participantId, status: newStatus }) => {
          console.log('Status change received:', { participantId, newStatus });
          
          const currentUserId = parseInt(localStorage.getItem('userId'));
          
          if (participantId === currentUserId) {
            setStatus(newStatus);
            if (newStatus === 'approved') {
              toast.success("You've been approved!");
            }
          }

          setSessionDetails(prev => {
            if (!prev || !prev.participants) return prev;
            return {
              ...prev,
              participants: prev.participants.map(p => 
                p.id === participantId ? { ...p, status: newStatus } : p
              )
            };
          });
        });

        // Handle participant updates
        socketInstance.on('participants-updated', (updatedParticipants) => {
          setSessionDetails(prev => ({
            ...prev,
            participants: updatedParticipants || []
          }));
        });

        // Listen for quiz start
        socketInstance.on('quiz-started', () => {
          console.log('Quiz started, navigating to quiz page');
          toast.success('Quiz is starting!');
          navigate(`/quiz/${sessionId}/participate`);
        });

        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
          toast.error(error.message);
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnecting(true);
        });

        socketInstance.on('reconnect', () => {
          console.log('Socket reconnected');
          socketInstance.emit('join-waiting-room', { sessionId });
          setIsConnecting(false);
        });
      }
    } catch (error) {
      console.error('Socket initialization error:', error);
      toast.error('Failed to connect to server');
      setIsConnecting(false);
    }
  }, [sessionId, navigate]);

  const fetchSessionDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        setSessionDetails(data || {
          sessionCode: '',
          quizName: '',
          participants: [],
          expiresAt: null
        });
        
        const currentParticipant = data.participants?.find(
          p => p.id === parseInt(localStorage.getItem('userId'))
        );
        
        if (currentParticipant) {
          setStatus(currentParticipant.status);
        }
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Failed to load session details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    initializeSocket();
    fetchSessionDetails();

    return () => {
      if (socket) {
        console.log('Cleaning up socket connection');
        socket.disconnect();
      }
    };
  }, [initializeSocket, fetchSessionDetails]);

  if (loading || isConnecting) {
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
        <Typography>
          {loading ? 'Loading session details...' : 'Connecting to server...'}
        </Typography>
      </Box>
    );
  }

  return (
    <div className="waiting-room-container">
      <Paper className="waiting-room-content">
        <Box className="header-section">
          <Typography variant="h5" gutterBottom>
            Session Code: <Chip label={sessionDetails.sessionCode} color="primary" />
          </Typography>
          <Typography variant="h4" gutterBottom>
            {sessionDetails.quizName}
          </Typography>
        </Box>

        <Box className="status-section">
          <Typography variant="h6" gutterBottom>
            Your Status: <Chip 
              label={status}
              color={status === 'approved' ? 'success' : 'warning'}
            />
          </Typography>
          <Typography>
            {status === 'waiting' 
              ? 'Please wait for the host to approve your participation'
              : 'You are approved! Waiting for the quiz to start...'}
          </Typography>
        </Box>

        <Box className="participants-section">
          <Typography variant="h6" gutterBottom>
            <Users size={20} style={{ marginRight: 8 }} />
            Participants ({sessionDetails.participants?.length || 0})
          </Typography>
          
          <Box className="participants-list">
            {sessionDetails.participants?.map(participant => (
              <Box 
                key={participant.id}
                className={`participant-item ${participant.status}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
              >
                <Typography>{participant.username}</Typography>
                <Chip
                  label={participant.status}
                  color={participant.status === 'approved' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default WaitingRoom; 
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
import socketService from '../../services/socketService';
import { Clock } from 'react-feather';
import { toast } from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './styles/HostControl.css';
import axios from 'axios';

const HostControl = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentSession, participants, setParticipants } = useSession();
  const [socket, setSocket] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showLifetimeDialog, setShowLifetimeDialog] = useState(false);
  const [sessionLifetime, setSessionLifetime] = useState(24);
  const [isStarting, setIsStarting] = useState(false);

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
        console.log('Session Details:', response.data.data);
        setSessionDetails(response.data.data);
        setParticipants(response.data.data.participants || []);
      } else {
        toast.error('Failed to load session details');
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error(error.response?.data?.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  }, [sessionId, setParticipants]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  useEffect(() => {
    let socketInstance = null;
    
    const initializeSocket = async () => {
      try {
        socketInstance = socketService.connect();
        if (socketInstance) {
          setSocket(socketInstance);
          
          socketInstance.emit('join-session', { sessionId });
          
          socketInstance.on('participant-joined', (participant) => {
            console.log('Participant joined:', participant);
            setParticipants(prev => {
              const exists = prev.some(p => p.id === participant.id);
              return exists ? prev : [...prev, participant];
            });
          });

          socketInstance.on('participant-status-changed', ({ participantId, status }) => {
            console.log('Status change received in host:', { participantId, status });
            setParticipants(prev => 
              prev.map(p => p.id === participantId ? { ...p, status } : p)
            );
          });

          socketInstance.on('error', (error) => {
            console.error('Socket error:', error);
            toast.error(error.message);
          });

          socketInstance.on('quiz-started', () => {
            navigate(`/host/quiz/${sessionId}`);
          });
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
        toast.error('Failed to connect to server');
      }
    };

    initializeSocket();
    fetchSessionDetails();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [sessionId, setParticipants, navigate]);

  useEffect(() => {
    if (sessionDetails?.expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expires = new Date(sessionDetails.expiresAt).getTime();
        const remaining = expires - now;
        
        if (remaining <= 0) {
          setTimeRemaining(null);
          toast.error('Session has expired');
          // Optionally redirect or handle expired session
        } else {
          setTimeRemaining(remaining);
        }
      };

      // Update immediately
      updateTimer();
      
      // Then update every second
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionDetails?.expiresAt]);

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds) return 'Expired';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return <div>Loading session details...</div>;
  }

  const handleApprove = (participantId) => {
    if (!socket) return;
    console.log('Sending approve request:', { sessionId, participantId });
    socket.emit('approve-participant', { sessionId, participantId });
  };

  const handleRemove = (participantId) => {
    if (!socket) return;
    socket.emit('remove-participant', { sessionId, participantId });
  };

  const startQuiz = () => {
    if (!socket || isStarting) {
      return;
    }

    const approvedParticipants = participants.filter(p => p.status === 'approved');
    if (approvedParticipants.length === 0) {
      toast.error('Need at least one approved participant to start');
      return;
    }

    setIsStarting(true);
    socket.emit('start-quiz', { sessionId });
    toast.success('Starting quiz...');
  };

  const handleSetLifetime = () => {
    // Implement this function to set session lifetime
  };

  return (
    <div className="host-control-container">
      <div className="host-control-panel">
        <div className="panel-header">
          <h1>Host Control Panel</h1>
          <div className="session-info">
            <div className="session-code">
              Session Code: <span>{sessionDetails?.sessionCode}</span>
            </div>
            {timeRemaining && (
              <div className="session-timer">
                <Clock size={16} />
                <span>Expires in: {formatTimeRemaining(timeRemaining)}</span>
              </div>
            )}
            <div className="participant-count">
              {participants.length} Participants
            </div>
          </div>
        </div>

        <div className="participants-list">
          {participants.map(participant => (
            <div key={participant.id} className="participant-row">
              <span className="participant-name">{participant.username}</span>
              <div className="action-buttons">
                {participant.status === 'waiting' && (
                  <button
                    className="approve-button"
                    onClick={() => handleApprove(participant.id)}
                  >
                    Approve
                  </button>
                )}
                <button
                  className="remove-button"
                  onClick={() => handleRemove(participant.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="start-quiz-button"
          onClick={startQuiz}
          disabled={isStarting || !participants.some(p => p.status === 'approved')}
        >
          {isStarting ? 'Starting...' : 'Start Quiz Now'}
        </button>
      </div>

      <Dialog open={showLifetimeDialog} onClose={() => setShowLifetimeDialog(false)}>
        <DialogTitle>Set Session Lifetime</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Duration (hours)"
            type="number"
            fullWidth
            value={sessionLifetime}
            onChange={(e) => setSessionLifetime(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, max: 72 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLifetimeDialog(false)}>Cancel</Button>
          <Button onClick={handleSetLifetime} color="primary">
            Set Duration
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HostControl; 
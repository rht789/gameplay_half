import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import './styles/HostControl.css';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const HostControl = () => {
  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [socket, setSocket] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [autoStartTimer, setAutoStartTimer] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket;
    try {
      const token = localStorage.getItem('token');
      newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        toast.success('Connected to session');
        newSocket.emit('join-session', { sessionId });
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Connection error');
      });

      newSocket.on('participant-joined', (participant) => {
        console.log('Participant joined:', participant);
        setSessionDetails(prev => ({
          ...prev,
          participants: [...(prev?.participants || []), participant]
        }));
      });

      newSocket.on('session-update', ({ participants }) => {
        console.log('Session update received:', participants);
        setSessionDetails(prev => ({
          ...prev,
          participants
        }));
      });

      newSocket.on('participant-removed', ({ participantId }) => {
        setSessionDetails(prev => ({
          ...prev,
          participants: prev.participants.filter(p => p.id !== participantId)
        }));
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } catch (error) {
      console.error('Socket initialization error:', error);
      toast.error('Failed to connect to server');
    }
  }, [sessionId]);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/sessions/${sessionId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setSessionDetails(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        toast.error('Failed to fetch session details');
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const handleApprove = (participantId) => {
    if (!socket?.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('approve-participant', { sessionId, participantId });
    setSessionDetails(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId ? { ...p, status: 'approved' } : p
      )
    }));
  };

  const handleRemove = (participantId) => {
    if (!socket?.connected) {
      toast.error('Not connected to server');
      return;
    }

    // Don't allow host to remove themselves
    const participant = sessionDetails.participants.find(p => p.id === participantId);
    if (participant.userId === user?.id) {
      toast.error("Host cannot remove themselves");
      return;
    }

    socket.emit('remove-participant', { sessionId, participantId });
  };

  const startQuiz = () => {
    if (!socket?.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('start-quiz', { sessionId });
    setAutoStartTimer(true);
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
            <div className="participant-count">
              {sessionDetails?.participants?.length || 0}
            </div>
          </div>
        </div>

        {autoStartTimer && timeLeft && (
          <div className="auto-start-banner">
            Quiz will auto-start in: {timeLeft} seconds
          </div>
        )}

        <div className="participants-list">
          {sessionDetails?.participants?.map(participant => (
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
          disabled={!sessionDetails?.participants?.some(p => p.status === 'approved')}
        >
          Start Quiz Now
        </button>
      </div>
    </div>
  );
};

export default HostControl; 
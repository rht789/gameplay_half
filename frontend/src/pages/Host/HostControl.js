import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
import socketService from '../../services/socketService';
import { toast } from 'react-hot-toast';
import './styles/HostControl.css';
import axios from 'axios';

const HostControl = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentSession, participants, setParticipants } = useSession();
  const [socket, setSocket] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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
            setParticipants(prev => [...prev, participant]);
          });

          socketInstance.on('participant-status-changed', ({ participantId, status }) => {
            console.log('Participant status changed:', participantId, status);
            setParticipants(prev => 
              prev.map(p => p.id === participantId ? { ...p, status } : p)
            );
          });

          socketInstance.on('error', (error) => {
            console.error('Socket error:', error);
            toast.error(error.message);
          });
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
        toast.error('Failed to connect to server');
      }
    };

    initializeSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [sessionId, setParticipants]);

  if (loading) {
    return <div>Loading session details...</div>;
  }

  const handleApprove = (participantId) => {
    if (!socket) return;
    socket.emit('approve-participant', { sessionId, participantId });
  };

  const handleRemove = (participantId) => {
    if (!socket) return;
    socket.emit('remove-participant', { sessionId, participantId });
  };

  const startQuiz = () => {
    if (!socket) return;
    socket.emit('start-quiz', { sessionId });
  };

  return (
    <div className="host-control-container">
      <div className="host-control-panel">
        <div className="panel-header">
          <h1>Host Control Panel</h1>
          <div className="session-info">
            <div className="session-code">
              Session Code: <span>{sessionDetails?.sessionCode || 'Loading...'}</span>
            </div>
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
          disabled={!participants.some(p => p.status === 'approved')}
        >
          Start Quiz Now
        </button>
      </div>
    </div>
  );
};

export default HostControl; 
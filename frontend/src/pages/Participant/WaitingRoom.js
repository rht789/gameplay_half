import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
import socketService from '../../services/socketService';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './styles/WaitingRoom.css';

const WaitingRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { setParticipants } = useSession();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('waiting');
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
        // Find current user's status
        const currentParticipant = response.data.data.participants.find(
          p => p.id === response.data.data.currentParticipantId
        );
        if (currentParticipant) {
          setStatus(currentParticipant.status);
        }
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Failed to load session details');
      navigate('/join-quiz');
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate, setParticipants]);

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

          socketInstance.emit('join-waiting-room', { sessionId });

          socketInstance.on('status-update', ({ status: newStatus }) => {
            setStatus(newStatus);
            if (newStatus === 'approved') {
              toast.success('You have been approved to join the quiz!');
            }
          });

          socketInstance.on('quiz-started', () => {
            navigate(`/quiz/${sessionId}`);
          });

          socketInstance.on('removed-from-session', () => {
            toast.error('You have been removed from the session');
            navigate('/join-quiz');
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
  }, [sessionId, navigate]);

  if (loading) {
    return <div className="waiting-room-container">
      <div className="waiting-room-content">
        <h2>Loading session details...</h2>
      </div>
    </div>;
  }

  return (
    <div className="waiting-room-container">
      <div className="waiting-room-content">
        <div className="header-section">
          <h1>Waiting Room</h1>
          <div className="session-info">
            <p>Session Code: {sessionDetails?.sessionCode}</p>
            <p>Quiz: {sessionDetails?.quizName}</p>
          </div>
        </div>

        <div className="status-section">
          <h2>Your Status: <span className={`status-badge ${status}`}>{status}</span></h2>
          {status === 'waiting' && (
            <p>Please wait for the host to approve your participation</p>
          )}
          {status === 'approved' && (
            <p>You're approved! Waiting for the quiz to start...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom; 
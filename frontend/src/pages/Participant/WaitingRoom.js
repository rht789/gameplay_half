import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import './styles/WaitingRoom.css';
import { toast } from 'react-hot-toast';

const WaitingRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(38);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/users/me`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading user data');
      }
    };

    fetchUserData();
  }, []);

  // Only establish socket connection after user data is loaded
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    const socket = io(process.env.REACT_APP_API_URL, {
      auth: { token },
      transports: ['websocket'],
      query: { sessionId }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join-session', { sessionId });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('participant-joined', (data) => {
      console.log('Participant joined:', data);
      setSessionDetails(prev => {
        if (!prev) return prev;
        const existingParticipant = prev.participants?.find(p => p.id === data.id);
        if (existingParticipant) return prev;
        
        return {
          ...prev,
          participants: [...(prev.participants || []), data]
        };
      });
    });

    socket.on('participant-approved', ({ participantId, status }) => {
      console.log('Participant approved:', participantId);
      setSessionDetails(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map(p =>
            p.id === participantId ? { ...p, status } : p
          )
        };
      });
    });

    socket.on('countdown-update', (timeRemaining) => {
      setTimeLeft(timeRemaining);
    });

    socket.on('participant-removed', ({ participantId, userId }) => {
      if (userId === user.id) {
        toast.error('You have been removed from the session by the host');
        navigate('/join-quiz');
      } else {
        setSessionDetails(prev => ({
          ...prev,
          participants: prev.participants.filter(p => p.id !== participantId)
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, navigate, user]);

  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/sessions/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setSessionDetails(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return <div className="waiting-room-container">Error: {error}</div>;
  }

  if (loading || !user) {
    return <div className="waiting-room-container">Loading...</div>;
  }

  return (
    <div className="waiting-room-container">
      <div className="waiting-room-content">
        {/* Header Section */}
        <div className="header-section">
          <div className="quiz-code">
            {sessionDetails?.sessionCode}
          </div>
          <div className="timer">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Quiz Info Section */}
        <div className="quiz-info-section">
          <h1>{sessionDetails?.quizName}</h1>
          <p>Test your knowledge across various topics in this exciting quiz!</p>
        </div>

        {/* Participants Section */}
        <div className="participants-section">
          <div className="section-header">
            <h2>Waiting ({sessionDetails?.participants?.filter(p => p.status === 'waiting')?.length || 0})</h2>
          </div>
          <div className="participants-list waiting">
            {sessionDetails?.participants
              ?.filter(p => p.status === 'waiting')
              ?.map(participant => (
                <div key={participant.id} className="participant-item">
                  <span>{participant.username}</span>
                  <span className="status-badge waiting">Waiting</span>
                </div>
              ))}
          </div>

          <div className="section-header">
            <h2>Approved ({sessionDetails?.participants?.filter(p => p.status === 'approved')?.length || 0})</h2>
          </div>
          <div className="participants-list approved">
            {sessionDetails?.participants
              ?.filter(p => p.status === 'approved')
              ?.map(participant => (
                <div key={participant.id} className="participant-item">
                  <span>{participant.username}</span>
                  <span className="status-badge approved">Approved</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom; 
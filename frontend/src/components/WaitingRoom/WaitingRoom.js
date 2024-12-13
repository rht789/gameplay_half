import React, { useEffect, useState } from 'react';
import { getSocket, joinSession } from '../../services/socket';

const WaitingRoom = () => {
  const [sessionId, setSessionId] = useState('');
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    const user = JSON.parse(localStorage.getItem('user'));

    // Join session
    joinSession(sessionId, user.userID);

    // Listen for new participants
    socket.on('participant_joined', (participant) => {
      setParticipants(prev => [...prev, participant]);
    });

    // Listen for participant approvals
    socket.on('participant_approved', ({ participantId }) => {
      setParticipants(prev => 
        prev.map(p => p.userId === participantId ? { ...p, status: 'approved' } : p)
      );
    });

    // Listen for participant departures
    socket.on('participant_left', (participant) => {
      setParticipants(prev => prev.filter(p => p.id !== participant.id));
    });

    // Get initial participants list
    socket.on('participants_list', (participants) => {
      setParticipants(participants);
    });

    return () => {
      socket.off('participant_joined');
      socket.off('participant_approved');
      socket.off('participant_left');
      socket.off('participants_list');
    };
  }, [sessionId]);

  return (
    <div>
      {/* Render your waiting room components here */}
    </div>
  );
};

export default WaitingRoom; 
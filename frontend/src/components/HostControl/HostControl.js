import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { initSocket, disconnectSocket } from '../../services/socket';

const HostControl = () => {
  const { sessionId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const socket = initSocket(sessionId);

    const handleConnect = () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      // Explicitly join session after connection
      socket.emit('join_session', { sessionId, userId: user?.userID });
    };

    const handleParticipantJoined = (participant) => {
      console.log('New participant joined:', participant);
      setParticipants(prev => {
        // Avoid duplicates
        if (!prev.find(p => p.id === participant.id)) {
          return [...prev, participant];
        }
        return prev;
      });
    };

    const handleParticipantLeft = (participant) => {
      console.log('Participant left:', participant);
      setParticipants(prev => prev.filter(p => p.id !== participant.id));
    };

    const handleParticipantsList = (list) => {
      console.log('Received participants list:', list);
      setParticipants(list);
    };

    socket.on('connect', handleConnect);
    socket.on('participant_joined', handleParticipantJoined);
    socket.on('participant_left', handleParticipantLeft);
    socket.on('participants_list', handleParticipantsList);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('participant_joined', handleParticipantJoined);
      socket.off('participant_left', handleParticipantLeft);
      socket.off('participants_list', handleParticipantsList);
      disconnectSocket();
    };
  }, [sessionId]);

  return (
    <div>
      <h2>Host Control Panel</h2>
      <div>
        <h3>Participants ({participants.length})</h3>
        <ul>
          {participants.map((participant) => (
            <li key={participant.id}>
              {participant.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HostControl; 
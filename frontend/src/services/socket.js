import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

let socket = null;

export const initSocket = (sessionId) => {
  if (!socket) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token,
        sessionId,
        userId: user?.userID
      },
      path: '/socket.io'
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully for session:', sessionId);
      if (sessionId && user?.userID) {
        socket.emit('join_session', { sessionId, userId: user.userID });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
      toast.error(message);
    });
  }
  return socket;
};

export const joinSession = (sessionId, userId) => {
  if (!socket) {
    socket = initSocket(sessionId);
  }
  if (socket && socket.connected) {
    socket.emit('join_session', { sessionId, userId });
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 
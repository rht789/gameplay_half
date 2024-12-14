import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    try {
      if (this.socket?.connected) {
        console.log('Reusing existing socket connection');
        return this.socket;
      }

      if (this.socket) {
        console.log('Cleaning up existing socket before new connection');
        this.socket.disconnect();
        this.socket = null;
      }

      console.log('Creating new socket connection');
      this.socket = io(process.env.REACT_APP_API_URL, {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully:', this.socket.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Retrying...');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          this.socket.connect();
        }
      });

      return this.socket;
    } catch (error) {
      console.error('Socket initialization error:', error);
      toast.error('Failed to connect to server');
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket:', this.socket.id);
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Helper method to ensure socket is connected
  ensureConnection() {
    if (!this.socket?.connected) {
      return this.connect();
    }
    return this.socket;
  }
}

export default new SocketService(); 
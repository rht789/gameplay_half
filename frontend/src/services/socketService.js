import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.connectionAttempts = 0;
    this.maxAttempts = 3;
  }

  connect() {
    if (this.connectionAttempts >= this.maxAttempts) {
      toast.error('Failed to connect to server after multiple attempts');
      return null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return null;
    }

    try {
      this.socket = io(process.env.REACT_APP_API_URL, {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 20000,
        withCredentials: true,
        forceNew: true,
        autoConnect: false
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.connectionAttempts++;
        if (this.connectionAttempts >= this.maxAttempts) {
          toast.error('Unable to connect to server');
        }
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.connectionAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      this.socket.connect();
      return this.socket;
    } catch (error) {
      console.error('Socket initialization error:', error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionAttempts = 0;
    }
  }

  getSocket() {
    if (!this.socket?.connected) {
      return this.connect();
    }
    return this.socket;
  }
}

export default new SocketService(); 
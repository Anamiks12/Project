import axios from 'axios';

const BASE_URL = 'https://chat-api-k4vi.onrender.com';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User endpoints
export const setUsername = async (username) => {
  try {
    const response = await apiClient.post('/chat/username', { username });
    return response.data;
  } catch (error) {
    console.error('Error setting username:', error);
    throw error;
  }
};

// Room endpoints
export const getRooms = async () => {
  try {
    const response = await apiClient.get('/chat/rooms');
    return response.data;
  } catch (error) {
    console.error('Error getting rooms:', error);
    throw error;
  }
};

export const createRoom = async (roomName, createdBy) => {
  try {
    const response = await apiClient.post('/chat/rooms', { name: roomName, created_by: createdBy });
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const getRoomMessages = async (roomId) => {
  try {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// WebSocket connection
export const createWebSocketConnection = (roomId, username) => {
  const socket = new WebSocket(`ws://chat-api-k4vi.onrender.com/ws/${roomId}/${username}`);
  
  return {
    socket,
    
    connect: (onMessage, onOpen, onClose, onError) => {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        if (onOpen) onOpen();
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        if (onClose) onClose(event);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };
    },
    
    sendMessage: (content) => {
      if (socket.readyState === WebSocket.OPEN) {
        const message = {
          event: 'message',
          content: content
        };
        socket.send(JSON.stringify(message));
      } else {
        console.error('WebSocket is not connected');
      }
    },
    
    disconnect: () => {
      socket.close();
    }
  };
};

export default {
  setUsername,
  getRooms,
  createRoom,
  getRoomMessages,
  createWebSocketConnection
};
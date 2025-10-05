import { IResolvers } from 'graphql-tools';
import axios from 'axios';

const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const chatServiceUrl = process.env.CHAT_SERVICE_URL || 'http://localhost:3002';

export const resolvers: IResolvers = {
  Query: {
    // User queries
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.get(`${authServiceUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.user;
      } catch (error) {
        throw new Error('Failed to fetch user profile');
      }
    },

    users: async (_, { search, limit }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const params = new URLSearchParams();
        if (search) params.append('q', search);
        if (limit) params.append('limit', limit.toString());
        
        const response = await axios.get(`${authServiceUrl}/users/search?${params}`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.users;
      } catch (error) {
        throw new Error('Failed to search users');
      }
    },

    user: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.get(`${authServiceUrl}/users/${id}`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.user;
      } catch (error) {
        throw new Error('User not found');
      }
    },

    // Room queries
    rooms: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.get(`${chatServiceUrl}/rooms`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.rooms;
      } catch (error) {
        throw new Error('Failed to fetch rooms');
      }
    },

    room: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.get(`${chatServiceUrl}/rooms/${id}`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.room;
      } catch (error) {
        throw new Error('Room not found');
      }
    },

    // Message queries
    messages: async (_, { roomId, page, limit }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        const response = await axios.get(`${chatServiceUrl}/messages/room/${roomId}?${params}`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data;
      } catch (error) {
        throw new Error('Failed to fetch messages');
      }
    },

    message: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.get(`${chatServiceUrl}/messages/${id}`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.message;
      } catch (error) {
        throw new Error('Message not found');
      }
    }
  },

  Mutation: {
    // Auth mutations
    register: async (_, { input }) => {
      try {
        const response = await axios.post(`${authServiceUrl}/auth/register`, input);
        return response.data;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Registration failed');
      }
    },

    login: async (_, { input }) => {
      try {
        const response = await axios.post(`${authServiceUrl}/auth/login`, input);
        return response.data;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Login failed');
      }
    },

    updateProfile: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.put(`${authServiceUrl}/users/profile`, input, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.user;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Failed to update profile');
      }
    },

    // Room mutations
    createRoom: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.post(`${chatServiceUrl}/rooms`, input, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.room;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Failed to create room');
      }
    },

    updateRoom: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.put(`${chatServiceUrl}/rooms/${id}`, input, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.room;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Failed to update room');
      }
    },

    addRoomMember: async (_, { roomId, userId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.post(`${chatServiceUrl}/rooms/${roomId}/members`, { userId }, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.room;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Failed to add member');
      }
    },

    removeRoomMember: async (_, { roomId, userId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        await axios.delete(`${chatServiceUrl}/rooms/${roomId}/members/${userId}`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return true;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Failed to remove member');
      }
    },

    // Message mutations
    createMessage: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.post(`${chatServiceUrl}/messages`, input, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.data;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Failed to create message');
      }
    },

    updateMessage: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const response = await axios.put(`${chatServiceUrl}/messages/${id}`, input, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return response.data.data;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Failed to update message');
      }
    },

    deleteMessage: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        await axios.delete(`${chatServiceUrl}/messages/${id}`, {
          headers: { Authorization: `Bearer ${getTokenFromContext(context)}` }
        });
        return true;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Failed to delete message');
      }
    }
  }
};

// Helper function to extract token from context
function getTokenFromContext(context: any): string {
  return context.req.headers.authorization?.replace('Bearer ', '') || '';
}

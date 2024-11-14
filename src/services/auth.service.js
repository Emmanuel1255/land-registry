// src/services/auth.service.js
import api from './api';

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  },

  async loginWithDemo() {
    try {
      const demoCredentials = {
        email: 'demo@landregistry.com',
        password: 'demo123456',
      };
      return await this.login(demoCredentials);
    } catch (error) {
      throw new Error('Demo login failed: ' + error.message);
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optionally clear any other stored data
    localStorage.clear(); // Use this if you want to clear all localStorage
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    // Optional: Check token expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      throw new Error(message);
    }
  },

  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;
  
      // Check if all required fields are present
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new AppError('All password fields are required', 400);
      }
  
      // Ensure new password and confirm password match
      if (newPassword !== confirmPassword) {
        throw new AppError('New password and confirm password do not match', 400);
      }
  
      // Find user by ID with the password field included
      const user = await User.findById(userId).select('+password');
  
      if (!user) {
        throw new AppError('User not found', 404);
      }
  
      // Verify the current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
  
      // Save the updated user
      await user.save();
  
      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
  ,

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset request failed';
      throw new Error(message);
    }
  },

  // Helper method to setup auth header
  setupAuthHeader(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
};

// Initialize auth header if token exists
const token = localStorage.getItem('token');
if (token) {
  authService.setupAuthHeader(token);
}
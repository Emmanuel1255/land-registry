// src/services/dashboard.service.js
import api from './api';

export const dashboardService = {
  async getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getRegistrationTrends() {
    const response = await api.get('/dashboard/trends');
    return response.data;
  },

  async getRecentActivities() {
    const response = await api.get('/dashboard/activities');
    return response.data;
  },

  async fetchDashboardData() {
    try {
      const [stats, trends, activities] = await Promise.all([
        this.getDashboardStats(),
        this.getRegistrationTrends(),
        this.getRecentActivities()
      ]);
      return { stats, trends, activities };
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch dashboard data';
    }
  }
};
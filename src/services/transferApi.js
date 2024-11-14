// src/services/transferApi.js
import api from './api';

export const transferApi = {
  // Initiate a new transfer
  async initiateTransfer(transferData) {
    try {
      const { data } = await api.post('/transfer/initiate', transferData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error initiating transfer');
    }
  },

  // Upload transfer documents
  async uploadDocuments(transferId, documents) {
    try {
      const formData = new FormData();
      documents.forEach(doc => {
        formData.append('documents', doc);
      });

      const { data } = await api.post(
        `/transfer/${transferId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error uploading documents');
    }
  },

  // Update transfer details
  async updateTransfer(transferId, updateData) {
    try {
      const { data } = await api.put(`/transfer/${transferId}`, updateData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating transfer');
    }
  },

  // Complete transfer with signature
  async completeTransfer(transferId, signature, transferData) {
    try {
      const { data } = await api.post(`/transfer/${transferId}/complete`, {
        signature,
        ...transferData,
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error completing transfer');
    }
  },

  // Get transfer details
  async getTransfer(transferId) {
    try {
      const { data } = await api.get(`/transfer/${transferId}`);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching transfer details');
    }
  },

  // List transfers for a user
  async listTransfers(filters = {}) {
    try {
      const { data } = await api.get('/transfer/list', { params: filters });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching transfers');
    }
  },

  // Get users for selection
  async getUsers(searchTerm = '') {
    try {
      const { data } = await api.get('/users', {
        params: { search: searchTerm }
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching users');
    }
  },

  // Verify transfer eligibility
  async verifyEligibility(propertyId, userId) {
    try {
      const { data } = await api.post('/transfer/verify-eligibility', {
        propertyId,
        userId
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error verifying eligibility');
    }
  }
};
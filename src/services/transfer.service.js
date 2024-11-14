// src/services/transfer.service.js
import api from './api';

export const transferService = {
  // Initiate a new transfer
  async initiateTransfer(transferData) {
    try {
      // Format the data to match the backend schema
      const formattedData = {
        propertyId: transferData.propertyId,
        toOwnerId: transferData.toOwnerId,
        transferReason: transferData.transferReason,
        agreementDate: transferData.agreementDate,
        toOwnerDetails: {
          name: `${transferData.toOwner.firstName} ${transferData.toOwner.lastName}`,
          identification: transferData.toOwner.id || transferData.toOwner._id,
          contact: transferData.toOwner.email
        }
      };

      const response = await api.post('/properties/transfer/initiate', formattedData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to initiate transfer');
    }
  },

  // Upload transfer documents
  async uploadTransferDocuments(transferId, files) {
    try {
      const formData = new FormData();
      
      // Handle each file type separately
      files.forEach((file, index) => {
        // Determine document type based on file type or index
        const docType = file.type.includes('pdf') ? 'deed' : 'supporting';
        formData.append(`documents`, file);
        formData.append('documentTypes', docType); // Add document type information
      });

      // Add any additional metadata
      formData.append('transferId', transferId);

      const response = await api.post(
        `/properties/transfer/${transferId}/documents`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // You could add a progress callback here if needed
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Document upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload documents');
    }
  },

  // Update transfer details with optional document upload
  async updateTransfer(transferId, updateData, files = null) {
    try {
      let updatedTransfer;

      // If there are files to upload, handle them first
      if (files && files.length > 0) {
        const formData = new FormData();
        
        // Append files
        files.forEach(file => {
          formData.append('documents', file);
        });

        // Append other update data
        Object.keys(updateData).forEach(key => {
          formData.append(key, typeof updateData[key] === 'object' 
            ? JSON.stringify(updateData[key]) 
            : updateData[key]
          );
        });

        updatedTransfer = await api.put(
          `/properties/transfer/${transferId}`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Regular update without files
        updatedTransfer = await api.put(`/properties/transfer/${transferId}`, updateData);
      }

      return updatedTransfer.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update transfer');
    }
  },

  // Delete a document from transfer
  async deleteTransferDocument(transferId, documentId) {
    try {
      const response = await api.delete(`/properties/transfer/${transferId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete document');
    }
  },

  // Complete transfer with signature and final documents
  async completeTransfer(transferId, transferData, signature = null) {
    try {
      const formData = new FormData();

      // Add signature if provided
      if (signature) {
        // Convert base64 signature to blob if needed
        const signatureBlob = await (async () => {
          if (signature.startsWith('data:')) {
            const response = await fetch(signature);
            return response.blob();
          }
          return signature;
        })();
        formData.append('signature', signatureBlob);
      }

      // Add transfer data
      Object.keys(transferData).forEach(key => {
        formData.append(key, typeof transferData[key] === 'object' 
          ? JSON.stringify(transferData[key]) 
          : transferData[key]
        );
      });

      const response = await api.post(
        `/properties/transfer/${transferId}/complete`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete transfer');
    }
  },

  // ... rest of the methods remain the same ...
  async getTransfer(transferId) {
    try {
      const response = await api.get(`/properties/transfer/${transferId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transfer details');
    }
  },

  async listTransfers(filters = {}) {
    try {
      const response = await api.get('/properties/transfer/list', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transfers');
    }
  },

  async getUsers(searchTerm = '', exclude = []) {
    try {
      const response = await api.get('/users/search', {
        params: {
          search: searchTerm,
          exclude: exclude.join(',')
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  async verifyEligibility(propertyId, userId) {
    try {
      const response = await api.post('/properties/transfer/verify-eligibility', {
        propertyId,
        userId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify eligibility');
    }
  }
};
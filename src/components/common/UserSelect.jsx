// src/components/common/UserSelect.jsx
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon,XMarkIcon, } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';
import api from '@/services/api';

const UserSelect = ({ 
  onSelect, 
  selectedUserId, 
  error, 
  exclude = [], 
  label,
  required = false 
}) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Debounced search function
  const debouncedSearch = debounce(async (term) => {
    try {
      setLoading(true);
      setSearchError('');

      // Convert exclude to array of ids if needed
      const excludeIds = exclude.map(id => typeof id === 'object' ? id._id : id).filter(Boolean);
      
      const response = await api.get('/users/search', { 
        params: { 
          search: term,
          exclude: excludeIds.join(',')
        }
      });
      
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSearchError('Failed to fetch users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    // Only search if there's a search term or if it's the initial load
    if (searchTerm || users.length === 0) {
      debouncedSearch(searchTerm);
    }
    
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    // Clear error when user starts typing
    if (error) {
      onSelect(null); // Clear selection if there was an error
    }
  };

  const handleUserSelect = (user) => {
    console.log('Selected user:', user); // For debugging
    setSearchTerm(`${user.firstName} ${user.lastName}`);
    onSelect(user);
  };

  const clearSelection = () => {
    setSearchTerm('');
    onSelect(null);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          className={`block w-full pl-10 pr-10 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} 
            rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 
            focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setUsers([])} // Clear results when focusing to trigger new search
        />

        {searchTerm && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>

      {(error || searchError) && (
        <p className="text-sm text-red-600">
          {error || searchError}
        </p>
      )}

      {/* Only show dropdown when input is focused and there's no selection */}
      {(!selectedUserId && (searchTerm || loading)) && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg border border-gray-200">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <span className="ml-2">Loading users...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? `No users found for "${searchTerm}"` : 'Start typing to search users'}
            </div>
          ) : (
            users.map(user => (
              <div
                key={user.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 ${
                  selectedUserId === user.id ? 'bg-primary-50' : ''
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {selectedUserId === user.id && (
                    <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Show selected user summary */}
      {selectedUserId && users.find(u => u.id === selectedUserId) && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Selected User:
              </p>
              <p className="text-sm text-gray-500">
                {users.find(u => u.id === selectedUserId)?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelect;
import api from './api';

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    
    // Update localStorage with new data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...user, ...response.data.user };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update profile';
  }
};

// Get user profile
export const getProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch profile';
  }
};

// Search users
export const searchUsers = async (params) => {
  try {
    const response = await api.get('/users/search', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to search users';
  }
};

// Update location
export const updateLocation = async (locationData) => {
  try {
    const response = await api.put('/users/location', locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update location';
  }
};

// Search nearby users
export const searchNearbyUsers = async (params) => {
  try {
    const response = await api.get('/users/nearby', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to search nearby users';
  }
};

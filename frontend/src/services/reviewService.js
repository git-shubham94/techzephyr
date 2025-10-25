import api from './api';

// Submit review
export const submitReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to submit review';
  }
};

// Get user reviews
export const getUserReviews = async (userId) => {
  try {
    const response = await api.get(`/reviews/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch reviews';
  }
};

// Get user reputation
export const getUserReputation = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/reputation`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch reputation';
  }
};

// Add rating
export const addRating = async (ratingData) => {
  try {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to add rating';
  }
};

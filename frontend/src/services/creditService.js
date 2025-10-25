import api from './api';

// Get user credits and transactions
export const getCredits = async () => {
  try {
    const response = await api.get('/credits');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch credits';
  }
};

// Award credits for action
export const awardCredits = async (action, relatedId = null) => {
  try {
    const response = await api.post('/credits/award', { action, relatedId });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to award credits';
  }
};

// Redeem credits
export const redeemCredits = async (amount, reason) => {
  try {
    const response = await api.post('/credits/redeem', { amount, reason });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to redeem credits';
  }
};

// Get credit history
export const getCreditHistory = async () => {
  try {
    const response = await api.get('/credits/history');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch credit history';
  }
};

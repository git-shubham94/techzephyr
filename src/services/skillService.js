import api from './api';

// Get user skills
export const getSkills = async () => {
  try {
    const response = await api.get('/skills');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch skills';
  }
};

// Add new skill
export const addSkill = async (skillData) => {
  try {
    const response = await api.post('/skills', skillData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to add skill';
  }
};

// Delete skill
export const deleteSkill = async (skillId) => {
  try {
    const response = await api.delete(`/skills/${skillId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete skill';
  }
};

// Search skills
export const searchSkills = async (query) => {
  try {
    const response = await api.get('/skills/search', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to search skills';
  }
};

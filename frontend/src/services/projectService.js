import api from './api';

// Get all projects
export const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch projects';
  }
};

// Create project
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create project';
  }
};

// Join project
export const joinProject = async (projectId) => {
  try {
    const response = await api.post(`/projects/${projectId}/join`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to join project';
  }
};

// Get project details
export const getProject = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch project';
  }
};

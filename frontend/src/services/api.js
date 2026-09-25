import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // System Health
  async checkHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (err) {
      console.warn('Backend offline or unreachable:', err.message);
      return { status: 'offline', error: err.message };
    }
  },

  // Mission Management
  async getMissions() {
    const response = await apiClient.get('/missions/');
    return response.data;
  },

  async getMission(id) {
    const response = await apiClient.get(`/missions/${id}`);
    return response.data;
  },

  async createMission(data) {
    const response = await apiClient.post('/missions/', data);
    return response.data;
  },

  async createDemoMission() {
    const response = await apiClient.post('/missions/demo');
    return response.data;
  },

  // File Upload
  async uploadVideo(missionId, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/missions/${missionId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  // Processing & Status
  async startProcessing(missionId) {
    const response = await apiClient.post(`/missions/${missionId}/process`);
    return response.data;
  },

  async getMissionStatus(missionId) {
    const response = await apiClient.get(`/missions/${missionId}/status`);
    return response.data;
  },

  async getMissionResults(missionId) {
    const response = await apiClient.get(`/missions/${missionId}/results`);
    return response.data;
  },

  async deleteMission(missionId) {
    const response = await apiClient.delete(`/missions/${missionId}`);
    return response.data;
  },
};

export default api;

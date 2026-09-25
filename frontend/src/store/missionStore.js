import { create } from 'zustand';
import api from '../services/api';

export const useMissionStore = create((set, get) => ({
  missions: [],
  activeMission: null,
  activeResults: null,
  activeStatus: null,
  isBackendOnline: true,
  isLoading: false,
  uploadProgress: 0,
  error: null,

  // Health Check
  checkHealth: async () => {
    const res = await api.checkHealth();
    set({ isBackendOnline: res.status === 'online' });
    return res;
  },

  // Fetch all missions
  fetchMissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getMissions();
      set({ missions: data, isLoading: false });
      return data;
    } catch (err) {
      set({
        error: 'Unable to connect to backend server. Make sure the FastAPI service is running.',
        isLoading: false,
      });
      return [];
    }
  },

  // Select an active mission
  selectMission: async (missionId) => {
    set({ isLoading: true, error: null });
    try {
      const mission = await api.getMission(missionId);
      set({ activeMission: mission, isLoading: false });
      return mission;
    } catch (err) {
      set({ error: `Failed to load mission ${missionId}`, isLoading: false });
      return null;
    }
  },

  // Create new mission
  createMission: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newMission = await api.createMission(data);
      set((state) => ({
        missions: [newMission, ...state.missions],
        activeMission: newMission,
        isLoading: false,
      }));
      return newMission;
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Failed to create mission', isLoading: false });
      throw err;
    }
  },

  // Launch Demo Mission
  launchDemoMission: async () => {
    set({ isLoading: true, error: null });
    try {
      const demoMission = await api.createDemoMission();
      set((state) => ({
        missions: [demoMission, ...state.missions],
        activeMission: demoMission,
        isLoading: false,
      }));
      return demoMission;
    } catch (err) {
      set({ error: 'Failed to initialize demo mission', isLoading: false });
      throw err;
    }
  },

  // Upload Video File
  uploadVideo: async (missionId, file) => {
    set({ isLoading: true, uploadProgress: 0, error: null });
    try {
      const result = await api.uploadVideo(missionId, file, (percent) => {
        set({ uploadProgress: percent });
      });
      // Refresh mission
      const updated = await api.getMission(missionId);
      set({ activeMission: updated, isLoading: false, uploadProgress: 100 });
      return result;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'File upload failed';
      set({ error: msg, isLoading: false, uploadProgress: 0 });
      throw new Error(msg);
    }
  },

  // Start Processing
  startProcessing: async (missionId) => {
    try {
      const result = await api.startProcessing(missionId);
      return result;
    } catch (err) {
      set({ error: 'Failed to start processing pipeline' });
      throw err;
    }
  },

  // Fetch Status
  fetchStatus: async (missionId) => {
    try {
      const status = await api.getMissionStatus(missionId);
      set({ activeStatus: status });
      return status;
    } catch (err) {
      console.warn('Error fetching status:', err);
      return null;
    }
  },

  // Load Complete 3D Results
  loadResults: async (missionId) => {
    set({ isLoading: true, error: null });
    try {
      const results = await api.getMissionResults(missionId);
      set({
        activeResults: results,
        activeMission: results.mission,
        isLoading: false,
      });
      return results;
    } catch (err) {
      set({ error: 'Failed to load 3D reconstruction results', isLoading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

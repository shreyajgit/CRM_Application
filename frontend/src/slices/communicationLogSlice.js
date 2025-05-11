import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [],
  filteredLogs: [],
  analytics: null,
  loading: false,
  error: null
};

const communicationLogSlice = createSlice({
  name: 'communicationLogs',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload === true) {
        state.error = null;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLogs: (state, action) => {
      state.logs = action.payload;
      state.filteredLogs = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFilteredLogs: (state, action) => {
      state.filteredLogs = action.payload;
      state.loading = false;
      state.error = null;
    },
    addLog: (state, action) => {
      state.logs.push(action.payload);
      state.filteredLogs.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateLogStatus: (state, action) => {
      const log = action.payload;
      
      // Update in main logs array
      const logIndex = state.logs.findIndex(l => l._id === log._id);
      if (logIndex !== -1) {
        state.logs[logIndex] = log;
      }
      
      // Update in filtered logs array
      const filteredLogIndex = state.filteredLogs.findIndex(l => l._id === log._id);
      if (filteredLogIndex !== -1) {
        state.filteredLogs[filteredLogIndex] = log;
      }
      
      state.loading = false;
      state.error = null;
    },
    removeLog: (state, action) => {
      state.logs = state.logs.filter(log => log._id !== action.payload);
      state.filteredLogs = state.filteredLogs.filter(log => log._id !== action.payload);
      state.loading = false;
      state.error = null;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setLogs,
  setFilteredLogs,
  addLog,
  updateLogStatus,
  removeLog,
  setAnalytics
} = communicationLogSlice.actions;

export default communicationLogSlice.reducer;
// campaignSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  currentCampaign: null,
  loading: false,
  error: null
};

const campaignSlice = createSlice({
  name: 'campaigns',
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
    setCampaigns: (state, action) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentCampaign: (state, action) => {
      state.currentCampaign = action.payload;
      state.loading = false;
      state.error = null;
    },
    addCampaign: (state, action) => {
      state.list.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateCampaign: (state, action) => {
      const index = state.list.findIndex(campaign => campaign._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      state.currentCampaign = action.payload;
      state.loading = false;
      state.error = null;
    },
    removeCampaign: (state, action) => {
      state.list = state.list.filter(campaign => campaign._id !== action.payload);
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setCampaigns,
  setCurrentCampaign,
  addCampaign,
  updateCampaign,
  removeCampaign
} = campaignSlice.actions;

export default campaignSlice.reducer;
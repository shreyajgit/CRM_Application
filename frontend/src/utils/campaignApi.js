// campaignApi.js
import api from './api'; // Your API client
import { 
  setLoading, 
  setError, 
  setCampaigns, 
  setCurrentCampaign, 
  addCampaign, 
  updateCampaign, 
  removeCampaign 
} from '../slices/campaignsSlice';

const API_PATH = '/campaigns'; 

// Get all campaigns
export const fetchCampaigns = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get(`${API_PATH}/all-campaigns`);
    dispatch(setCampaigns(response.data.data));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch campaigns'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Get campaign by ID
export const fetchCampaignById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get(`${API_PATH}/campaign/${id}`);
    dispatch(setCurrentCampaign(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch campaign'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Create new campaign
export const createNewCampaign = (campaignData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.post(`${API_PATH}/create-campaign`, campaignData);
    dispatch(addCampaign(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to create campaign'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Update campaign
export const updateExistingCampaign = (id, campaignData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.put(`${API_PATH}/update-campaign/${id}`, campaignData);
    dispatch(updateCampaign(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to update campaign'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Delete campaign
export const deleteCampaign = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.delete(`${API_PATH}/delete-campaign/${id}`);
    
    if (response.status === 200 || response.status === 204) {
      dispatch(removeCampaign(id));
      return true;
    } else {
      // Handle unexpected response
      dispatch(setError('Unexpected response when deleting campaign'));
      return false;
    }
  } catch (error) {
    // Improved error handling for unauthorized cases
    if (error.response && error.response.status === 401) {
      dispatch(setError('Unauthorized: Only the creator can delete this campaign'));
    } else if (error.response && error.response.status === 403) {
      dispatch(setError('Forbidden: You do not have permission to delete this campaign'));
    } else {
      dispatch(setError(error.response?.data?.message || 'Failed to delete campaign'));
    }
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

// Execute campaign
export const executeCampaign = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.post(`${API_PATH}/execute-campaign/${id}`);
    
    // Handle successful response
    if (response && response.data && response.data.data) {
      dispatch(updateCampaign(response.data.data));
      return response.data.data;
    } else {
      // Handle unexpected response format
      dispatch(setError('Invalid response format from server'));
      return null;
    }
  } catch (error) {
    console.error('Execute campaign error:', error);
    // Improved error handling
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to execute campaign';
    
    dispatch(setError(errorMessage));
    
    // Refresh campaign list to ensure UI is in sync
    dispatch(fetchCampaigns());
    
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Schedule campaign
export const scheduleCampaign = (id, scheduledDate) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.post(`${API_PATH}/schedule-campaign/${id}`, { scheduledDate });
    dispatch(updateCampaign(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to schedule campaign'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};
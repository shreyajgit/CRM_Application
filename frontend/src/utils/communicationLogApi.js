// communicationLogApi.js
import api from './api'; // Your API client
import { 
  setLoading, 
  setError, 
  setLogs,
  setFilteredLogs, 
  addLog, 
  updateLogStatus,
  removeLog,
  setAnalytics
} from '../slices/communicationLogSlice';

const API_PATH = '/api/communication-logs';

// Get all communication logs
export const fetchAllLogs = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get(API_PATH);
    dispatch(setLogs(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch communication logs'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Get logs by campaign ID
export const fetchLogsByCampaign = (campaignId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get(`${API_PATH}/campaign/${campaignId}`);
    dispatch(setFilteredLogs(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch campaign logs'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Get logs by customer ID
export const fetchLogsByCustomer = (customerId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get(`${API_PATH}/customer/${customerId}`);
    dispatch(setFilteredLogs(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch customer logs'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Create new communication log
export const createLog = (logData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.post(API_PATH, logData);
    dispatch(addLog(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to create communication log'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Update log status
export const updateStatus = (id, status, failureReason = null) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const payload = { status };
    
    if (failureReason && status === 'failed') {
      payload.failureReason = failureReason;
    }
    
    const response = await api.put(`${API_PATH}/${id}/status`, payload);
    dispatch(updateLogStatus(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to update log status'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// Delete log (admin only)
export const deleteLog = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.delete(`${API_PATH}/${id}`);
    
    if (response.status === 200 || response.status === 204) {
      dispatch(removeLog(id));
      return true;
    } else {
      dispatch(setError('Unexpected response when deleting log'));
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      dispatch(setError('Unauthorized: Only admins can delete logs'));
    } else {
      dispatch(setError(error.response?.data?.message || 'Failed to delete log'));
    }
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

// Get communication log analytics
export const fetchAnalytics = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get(`${API_PATH}/analytics`);
    dispatch(setAnalytics(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch analytics'));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};
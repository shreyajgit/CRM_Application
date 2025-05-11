// orderApi.js
import axios from 'axios'; // Using axios directly to avoid issues with api import
import { 
  setLoading, 
  setError, 
  setOrders, 
  setCurrentOrder, 
  addOrder, 
  updateOrder, 
  removeOrder 
} from '../slices/orderSlice';

const API_PATH = '/orders';

/**
 * Fetch all orders from the API
 * @returns {Promise} Promise with the orders data or null on error
 */
export const fetchOrders = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Use axios directly for the API call since there's an issue with api import
    const response = await axios.get('http://localhost:5000/api/orders/all-orders');

    // Ensure that the response data is an array
    const ordersData = response.data?.data || [];
    
    // Verify that ordersData is an array before dispatching
    if (!Array.isArray(ordersData)) {
      console.warn('Orders data is not an array:', ordersData);
      dispatch(setOrders([])); // Set empty array as fallback
      return [];
    }
    
    dispatch(setOrders(ordersData));
    return ordersData;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
    dispatch(setError(errorMessage));
    console.error('Error fetching orders:', error);
    // Always return an empty array on error to prevent filter errors
    dispatch(setOrders([]));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Fetch a specific order by ID
 * @param {string} id Order ID
 * @returns {Promise} Promise with the order data or null on error
 */
export const fetchOrderById = (id) => async (dispatch) => {
  try {
    if (!id) {
      throw new Error('Order ID is required');
    }
    
    dispatch(setLoading(true));
    
    const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format');
    }
    
    dispatch(setCurrentOrder(response.data.data));
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order';
    dispatch(setError(errorMessage));
    console.error(`Error fetching order ${id}:`, error);
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Create a new order
 * @param {Object} orderData Order data object
 * @returns {Promise} Promise with the created order data or null on error
 */
export const createNewOrder = (orderData) => async (dispatch) => {
  try {
    if (!orderData) {
      throw new Error('Order data is required');
    }
    
    dispatch(setLoading(true));
    
    const response = await axios.post('/api/orders', orderData);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format');
    }
    
    dispatch(addOrder(response.data.data));
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
    dispatch(setError(errorMessage));
    console.error('Error creating order:', error);
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Update an existing order
 * @param {string} id Order ID
 * @param {Object} orderData Order data object with updates
 * @returns {Promise} Promise with the updated order data or null on error
 */
export const updateExistingOrder = (id, orderData) => async (dispatch) => {
  try {
    if (!id) {
      throw new Error('Order ID is required');
    }
    
    if (!orderData) {
      throw new Error('Order data is required');
    }
    
    dispatch(setLoading(true));
    
    const response = await axios.put(`/api/orders/${id}`, orderData);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format');
    }
    
    dispatch(updateOrder(response.data.data));
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update order';
    dispatch(setError(errorMessage));
    console.error(`Error updating order ${id}:`, error);
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Delete an order
 * @param {string} id Order ID to delete
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 */
export const deleteOrder = (id) => async (dispatch) => {
  try {
    if (!id) {
      throw new Error('Order ID is required');
    }
    
    dispatch(setLoading(true));
    
    const response = await axios.delete(`/api/orders/${id}`);
    
    if (response.status === 200 || response.status === 204) {
      dispatch(removeOrder(id));
      return true;
    } else {
      throw new Error('Unexpected response when deleting order');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete order';
    dispatch(setError(errorMessage));
    console.error(`Error deleting order ${id}:`, error);
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Update an order's status
 * @param {string} id Order ID
 * @param {Object} statusData Object containing the new status
 * @returns {Promise} Promise with the updated order data or null on error
 */
export const updateOrderStatus = (id, statusData) => async (dispatch) => {
  try {
    if (!id) {
      throw new Error('Order ID is required');
    }
    
    if (!statusData || !statusData.status) {
      throw new Error('Status data is required');
    }
    
    dispatch(setLoading(true));
    
    const response = await axios.patch(`/api/orders/${id}/status`, statusData);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format');
    }
    
    dispatch(updateOrder(response.data.data));
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status';
    dispatch(setError(errorMessage));
    console.error(`Error updating order status for ${id}:`, error);
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};
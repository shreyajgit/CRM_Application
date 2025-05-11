// customerApi.js
import api from './api'; 

const API_PATH = '/customers'; 

export const fetchCustomers = async () => {
  try {
    const response = await api.get(`${API_PATH}/list`);
    if (response.data && response.data.customers) {
      return response.data.customers;
    } else {
      console.error('Unexpected API response format:', response.data);
      return []; 
    }
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`${API_PATH}/detail/${id}`);
    return response.data.customer;
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data?.message || 'Failed to fetch customer';
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await api.post(`${API_PATH}/create`, customerData);
    return response.data.customer; 
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data?.message || 'Failed to create customer';
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await api.put(`${API_PATH}/update/${id}`, customerData);
    return response.data.customer || response.data.data; 
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data?.message || 'Failed to update customer';
  }
};

export const deleteCustomer = async (id) => {
  try {
    await api.delete(`${API_PATH}/remove/${id}`);
    return id;
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data?.message || 'Failed to delete customer';
  }
};
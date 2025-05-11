import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  currentOrder: null,
  loading: false,
  error: null
};

const orderSlice = createSlice({
  name: 'orders',
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
    setOrders: (state, action) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
      state.loading = false;
      state.error = null;
    },
    addOrder: (state, action) => {
      state.list.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateOrder: (state, action) => {
      const index = state.list.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      state.currentOrder = action.payload;
      state.loading = false;
      state.error = null;
    },
    removeOrder: (state, action) => {
      state.list = state.list.filter(order => order._id !== action.payload);
      if (state.currentOrder && state.currentOrder._id === action.payload) {
        state.currentOrder = null;
      }
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setOrders,
  setCurrentOrder,
  addOrder,
  updateOrder,
  removeOrder
} = orderSlice.actions;

export default orderSlice.reducer;
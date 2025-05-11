import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  segments: [],
  tags: []
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers(state, action) {
      state.list = action.payload;
      
      // Extract unique segments and tags
      const segments = new Set();
      const tags = new Set();
      
      action.payload.forEach(customer => {
        if (customer.segment) {
          if (Array.isArray(customer.segment)) {
            customer.segment.forEach(s => segments.add(s));
          } else {
            segments.add(customer.segment);
          }
        }
        
        if (customer.tags && Array.isArray(customer.tags)) {
          customer.tags.forEach(tag => tags.add(tag));
        }
      });
      
      state.segments = [...segments];
      state.tags = [...tags];
    },
    addCustomer(state, action) {
      state.list.push(action.payload);
      
      // Update segments and tags
      if (action.payload.segment) {
        if (Array.isArray(action.payload.segment)) {
          action.payload.segment.forEach(s => {
            if (!state.segments.includes(s)) {
              state.segments.push(s);
            }
          });
        } else if (!state.segments.includes(action.payload.segment)) {
          state.segments.push(action.payload.segment);
        }
      }
      
      if (action.payload.tags && Array.isArray(action.payload.tags)) {
        action.payload.tags.forEach(tag => {
          if (!state.tags.includes(tag)) {
            state.tags.push(tag);
          }
        });
      }
    },
    updateCustomer(state, action) {
      const index = state.list.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
        
        // Recalculate segments and tags for entire list
        const segments = new Set();
        const tags = new Set();
        
        state.list.forEach(customer => {
          if (customer.segment) {
            if (Array.isArray(customer.segment)) {
              customer.segment.forEach(s => segments.add(s));
            } else {
              segments.add(customer.segment);
            }
          }
          
          if (customer.tags && Array.isArray(customer.tags)) {
            customer.tags.forEach(tag => tags.add(tag));
          }
        });
        
        state.segments = [...segments];
        state.tags = [...tags];
      }
    },
    removeCustomer(state, action) {
      state.list = state.list.filter(c => c._id !== action.payload);
      
      // Recalculate segments and tags after removal
      const segments = new Set();
      const tags = new Set();
      
      state.list.forEach(customer => {
        if (customer.segment) {
          if (Array.isArray(customer.segment)) {
            customer.segment.forEach(s => segments.add(s));
          } else {
            segments.add(customer.segment);
          }
        }
        
        if (customer.tags && Array.isArray(customer.tags)) {
          customer.tags.forEach(tag => tags.add(tag));
        }
      });
      
      state.segments = [...segments];
      state.tags = [...tags];
    }
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  removeCustomer
} = customerSlice.actions;

export default customerSlice.reducer;
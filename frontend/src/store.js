import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import customersReducer from './slices/customersSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import campaignsReducer from './slices/campaignsSlice';
import communicationLogsReducer from './slices/communicationLogSlice';
const rootReducer = combineReducers({
  customers: customersReducer,
  orders: orderReducer,
  user: userReducer,
  campaigns: campaignsReducer,
  communicationLogs:communicationLogsReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['customers', 'orders'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store); 
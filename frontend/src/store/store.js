// src/store/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
// Import other reducers as needed

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here
  },
});

export default store;

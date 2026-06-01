import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../slices/app/appSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});


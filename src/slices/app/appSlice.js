import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  count: 0,
  lastRoute: '/',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    increment(state) {
      state.count += 1;
    },
    decrement(state) {
      state.count -= 1;
    },
    setLastRoute(state, action) {
      state.lastRoute = action.payload;
    },
    reset(state) {
      state.count = 0;
    },
  },
});

export const { increment, decrement, setLastRoute, reset } = appSlice.actions;

export default appSlice.reducer;


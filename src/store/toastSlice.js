import { createSlice } from '@reduxjs/toolkit';

const TOAST_LIMIT = 4;
const TOAST_TTL_MS = 3500;

const initialState = {
  toasts: [], // { id, type, title, message }
};

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    pushToast: {
      reducer(state, action) {
        const { id, type, title, message } = action.payload;
        state.toasts.push({ id, type, title, message });
        if (state.toasts.length > TOAST_LIMIT) {
          state.toasts.splice(0, state.toasts.length - TOAST_LIMIT);
        }
      },
      prepare({ type = 'info', title, message }) {
        return {
          payload: {
            id: makeId(),
            type,
            title,
            message,
          },
        };
      },
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { pushToast, removeToast, clearToasts } = toastSlice.actions;

// Helper thunk-like action for UI components (no async deps)
export function pushAutoToast(payload) {
  return (dispatch) => {
    const action = pushToast(payload);
    const result = dispatch(action);

    // result is the action; we can get id from it via result.payload
    const id = result?.payload?.id;
    if (id) {
      window.setTimeout(() => dispatch(removeToast(id)), TOAST_TTL_MS);
    }
  };
}

export const TOAST_TTL = TOAST_TTL_MS;

export default toastSlice.reducer;


import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('staffsync_token') || null;
const user = localStorage.getItem('staffsync_user')
  ? JSON.parse(localStorage.getItem('staffsync_user'))
  : null;
const employee = localStorage.getItem('staffsync_employee')
  ? JSON.parse(localStorage.getItem('staffsync_employee'))
  : null;

const initialState = {
  user,
  employee,
  token,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.employee = action.payload.employee;
      state.token = action.payload.token;
      state.error = null;

      localStorage.setItem('staffsync_token', action.payload.token);
      localStorage.setItem('staffsync_user', JSON.stringify(action.payload.user));
      if (action.payload.employee) {
        localStorage.setItem('staffsync_employee', JSON.stringify(action.payload.employee));
      }
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateUserData: (state, action) => {
      if (action.payload.user) {
        state.user = { ...state.user, ...action.payload.user };
        localStorage.setItem('staffsync_user', JSON.stringify(state.user));
      }
      if (action.payload.employee) {
        state.employee = { ...state.employee, ...action.payload.employee };
        localStorage.setItem('staffsync_employee', JSON.stringify(state.employee));
      }
    },
    logout: (state) => {
      state.user = null;
      state.employee = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem('staffsync_token');
      localStorage.removeItem('staffsync_user');
      localStorage.removeItem('staffsync_employee');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  updateUserData,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;


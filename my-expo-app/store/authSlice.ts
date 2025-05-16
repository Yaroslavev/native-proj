import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthState {
  token: string | null;
  user: {
    email: string;
    name: string;
    age: string;
    phoneNumber: string | null;
    image: string;
    roles: string[];
  } | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ token: string; user: AuthState['user'] }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      AsyncStorage.setItem('token', action.payload.token);
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      AsyncStorage.removeItem('token');
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
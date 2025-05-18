import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import authReducer from './authSlice'
import { categoryApi } from '../api/categoryApi';
import {dishApi} from "../api/dishApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [dishApi.reducerPath]: dishApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(authApi.middleware)
    .concat(categoryApi.middleware)
    .concat(dishApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
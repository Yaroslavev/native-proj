import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { jwtDecode } from 'jwt-decode';
import { setAuth } from '../store/authSlice';
import { BASE_URL } from '../constants/urls';
import { RootState } from '../store';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    timeout: 10000,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (formData) => ({
        url: 'auth/register',
        method: 'POST',
        body: formData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.token;
          const decoded: any = jwtDecode(token);

          dispatch(setAuth({
            token,
            user: {
              email: decoded.email,
              name: decoded.name,
              age: decoded.age,
              phoneNumber: decoded.phoneNumber,
              image: decoded.image,
              roles: decoded.roles || [],
            },
          }));
        }
        catch (err) {
          console.error('Register error: ', err);
        }
      }
    }),
    login: builder.mutation({
      query: (formData) => ({
        url: 'auth/login',
        method: 'POST',
        body: formData,
      }),
      async onQueryStarted(_, {dispatch, queryFulfilled}) {
        try {
          const { data } = await queryFulfilled;
          const token = data.token;
          const decoded: any = jwtDecode(token);

          dispatch(setAuth({
            token,
            user: {
              email: decoded.email,
              name: decoded.name,
              age: decoded.age,
              phoneNumber: decoded.phoneNumber,
              image: decoded.image,
              roles: decoded.roles || [],
            }
          }));
        }
        catch (err) {
          console.error('Login error: ', err);
        }
      }
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: '/auth/update',
        method: 'PUT',
        body: formData,
      }),
      async onQueryStarted(_, {dispatch, queryFulfilled}) {
        try {
          const { data } = await queryFulfilled;
          const token = data.token;
          const decoded: any = jwtDecode(token);

          dispatch(setAuth({
            token,
            user: {
              email: decoded.email,
              name: decoded.name,
              age: decoded.age,
              phoneNumber: decoded.phoneNumber,
              image: decoded.image,
              roles: decoded.roles || [],
            }
          }));
        }
        catch (err) {
          console.error('Update error: ', err);
        }
      }
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useUpdateProfileMutation } = authApi;
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import {CreateDishResponse, DishItem, EditDishResponse} from "../models/dishModel";
import {DISH_URL} from "../constants/urls";

export const dishApi = createApi({
    reducerPath: 'dishApi',
    baseQuery: fetchBaseQuery({
        baseUrl: DISH_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Dishes'],
    endpoints: (builder) => ({
        getDishes: builder.query<DishItem[], string>({
            query: () => 'GetDishes',
            providesTags: ['Dishes'],
            transformResponse: (response: DishItem[], meta, arg) => {
                console.log(`Fetched dishes for user: ${arg}`);
                return response;
            },
        }),
        getDish: builder.query<DishItem, { id: number; userEmail: string }>({
            query: ({ id }) => `GetDish/${id}`,
            providesTags: (result, error, { id }) => [{ type: 'Dishes', id }],
        }),
        getDishesByCategory: builder.query<DishItem[], { categoryId: number; userEmail: string }>({
            query: ({ categoryId }) => `GetDishesByCategory/${categoryId}`,
            providesTags: ['Dishes'],
            transformResponse: (response: DishItem[], meta, arg) => {
                console.log(`Fetched dishes for category ${arg.categoryId}, user: ${arg.userEmail}`);
                return response;
            },
        }),
        createDish: builder.mutation<CreateDishResponse, FormData>({
            query: (formData) => ({
                url: 'CreateDish',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Dishes'],
        }),
        editDish: builder.mutation<EditDishResponse, FormData>({
            query: (formData) => ({
                url: 'EditDish',
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Dishes'],
        }),
        deleteDish: builder.mutation<void, number>({
            query: (id) => ({
                url: `DeleteDish/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Dishes'],
        }),
    }),
});

export const {
    useGetDishesQuery,
    useGetDishQuery,
    useGetDishesByCategoryQuery,
    useCreateDishMutation,
    useEditDishMutation,
    useDeleteDishMutation,
} = dishApi;
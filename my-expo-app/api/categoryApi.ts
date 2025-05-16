import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { CATEGORY_URL } from '../constants/urls';

interface CategoryItem {
  id: number;
  name: string;
  description: string;
  image?: string;
  userId: number;
}

interface CreateCategoryRequest {
  name: string;
  description: string;
  image?: { uri: string; type: string; name: string };
}

interface EditCategoryRequest extends CreateCategoryRequest {
  id: number;
}

interface CreateCategoryResponse {
  id: number;
}

interface EditCategoryResponse {
  id: number;
}

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: CATEGORY_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Categories'],
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryItem[], string>({
      query: () => 'GetCategories',
      providesTags: ['Categories'],
      transformResponse: (response: CategoryItem[], meta, arg) => {
        console.log(`Fetched categories for user: ${arg}`);
        return response;
      },
    }),
    getCategory: builder.query<CategoryItem, number>({
      query: (id) => `GetCategory/${id}`,
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),
    createCategory: builder.mutation<CreateCategoryResponse, FormData>({
      query: (formData) => ({
        url: 'CreateCategory',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Categories'],
    }),
    editCategory: builder.mutation<EditCategoryResponse, FormData>({
      query: (formData) => ({
        url: 'EditCategory',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `DeleteCategory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useEditCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
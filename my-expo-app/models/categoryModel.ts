export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  image?: string;
  userId: number;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  image?: { uri: string; type: string; name: string };
}

export interface EditCategoryRequest extends CreateCategoryRequest {
  id: number;
}

export interface CreateCategoryResponse {
  id: number;
}

export interface EditCategoryResponse {
  id: number;
}

export interface DishItem {
    id: number;
    name: string;
    description: string;
    price: number;
    images?: string[];
    categoryId: number;
}

export interface CreateDishResponse {
    id: number;
}

export interface EditDishResponse {
    id: number;
}
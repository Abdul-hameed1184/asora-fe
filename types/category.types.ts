export interface CategoryInput {
    name: string;
    slug: string;
    description: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
}
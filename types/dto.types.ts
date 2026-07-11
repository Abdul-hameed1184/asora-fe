export interface CreateAddressDto {
    address: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

export interface UpdateAddressDto {
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
}

export interface AddToCartDto {
    variantId: string;
    quantity: number;
}

export interface WishlistDto {
    productId: string;
}

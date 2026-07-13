export interface UpdateProfileDto {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profilePicture: string;
    bio: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface Address {
    id: string;
    address: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export interface CreateAddressDto {
    userId?: string;
    address: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export interface UpdateAddressDto
    extends Partial<CreateAddressDto> { }

export interface WishlistItem {
    id: string;
    productId: string;
    createdAt: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture: string;
    bio: string;
}
export interface SignupDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
    phoneNumber: string;
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
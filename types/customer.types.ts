// types/customer.types.ts

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    role: "CUSTOMER" | "ADMIN";
    isVerified: boolean;
    ordersPlaced: number;
    totalSpent: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetAdminCustomersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CustomerStatus;
}

export interface CustomerAddress {
    id: string;
    userId: string;
    address: string;
    country: string;
    state: string;
    city: string;
    street: string;
    zipCode: string;
    isDefault: boolean;
    createdAt: string;
}

export interface CustomerOrderSummary {
    id: string;
    orderNumber: string;
    orderStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    totalAmount: number;
    createdAt: string;
}

export interface CustomerDetail extends Customer {
    addresses: CustomerAddress[];
    orders: CustomerOrderSummary[];
}

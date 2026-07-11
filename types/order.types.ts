// types/order.ts

export type OrderStatus =
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

export type PaymentStatus =
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";

export type PaymentMethod =
    | "CARD"
    | "BANK_TRANSFER"
    | "CASH";


export interface OrderItem {
    id: string;
    orderId: string;
    variantId: string;
    productId: string;
    productName: string;
    size: string;
    color: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}


export interface OrderUser {
    firstName: string;
    lastName: string;
    email: string;
}

export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference: string;
    status: PaymentStatus;
    createdAt: string;
}

export interface Order {
    id: string;
    userId: string;
    orderNumber: string;

    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;

    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingCountry: string;

    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;

    createdAt: string;
    updatedAt: string;

    items: OrderItem[];
    payment: Payment | null;
    user: OrderUser;
}

export interface CreateOrderDto {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingCountry: string;
    paymentMethod: PaymentMethod;
}

export interface CancelOrderDto {
    reason: string;
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
}

export interface GetOrdersParams {
    page?: number;
    limit?: number;
    status?: OrderStatus;
}

export interface GetAdminOrdersParams
    extends GetOrdersParams {
    userId?: string;
}
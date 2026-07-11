export interface CreateAddressDto {
    address: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}


export interface CheckoutParams {
    userId: string;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingCountry: string;
    paymentMethod: "PAYSTACK" | "STRIPE" | "CARD" | "BANK_TRANSFER" | "CASH";
}
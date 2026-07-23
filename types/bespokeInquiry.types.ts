export interface CreateBespokeInquiryPayload {
  fullName: string;
  email: string;
  phone: string;
  occasion?: string;
  description: string;
  fabricPreference?: string;
  budgetRange?: string;
}

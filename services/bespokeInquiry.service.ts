import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { CreateBespokeInquiryPayload } from "@/types/bespokeInquiry.types";

export class BespokeInquiryService {
  static async send(payload: CreateBespokeInquiryPayload) {
    const response = await apiClient.post<ApiSuccess<null>>(
      "/bespoke-inquiries",
      payload
    );
    return response.data;
  }
}

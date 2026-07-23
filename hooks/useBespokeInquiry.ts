"use client";

import toast from "react-hot-toast";
import { useApiMutation } from "@/hooks/useApiMutation";
import { BespokeInquiryService } from "@/services/bespokeInquiry.service";
import { CreateBespokeInquiryPayload } from "@/types/bespokeInquiry.types";
import { ApiSuccess } from "@/types/api.types";

export function useSendBespokeInquiry() {
  const { mutate, isPending, isSuccess, error } = useApiMutation<
    ApiSuccess<null>,
    CreateBespokeInquiryPayload
  >({
    mutationFn: BespokeInquiryService.send,
  });

  function submit(
    payload: CreateBespokeInquiryPayload,
    onSuccess?: () => void
  ) {
    mutate(payload, {
      onSuccess(result) {
        toast.success(
          result.message ?? "Your inquiry has been sent — we'll be in touch by email shortly."
        );
        onSuccess?.();
      },
    });
  }

  return { submit, isPending, isSuccess, error };
}

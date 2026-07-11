"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useApiMutation } from "@/hooks/useApiMutation";
import { AuthService } from "@/services/auth.service";
import { LoginDto, AuthResponse } from "@/types/auth.types";
import { ApiSuccess } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import toast from "react-hot-toast";
export function useLogin() {
  const router = useRouter();
  const { login } = useAuthStore();

  const { mutate, isPending, error } = useApiMutation<
    ApiSuccess<AuthResponse>,
    LoginDto
  >({
    mutationFn: (credentials) =>
      AuthService.login(credentials).then((res) => res.data),
  });

  function submit(credentials: LoginDto) {
    mutate(credentials, {
      onSuccess(response) {
        login(response.data.token, response.data.user);

        toast.success(response.message)

        if (response.data.user?.role === 'ADMIN') {
          router.push("/admin");
        } else {
          router.push("/");
        }
      },
    });
  }

  return {
    submit,
    isPending,
    error: error as ApiError | null,
  };
}

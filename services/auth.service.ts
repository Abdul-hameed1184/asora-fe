import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { SignupDto, LoginDto, AuthResponse } from "@/types/auth.types";

export class AuthService {
  static signup(data: SignupDto) {
    return apiClient.post<ApiSuccess<AuthResponse>>("/auth/register", data, {
      withCredentials: true,
    });
  }

  static login(data: LoginDto) {
    return apiClient.post<ApiSuccess<AuthResponse>>("/auth/login", data, {
      withCredentials: true,
    });
  }

  static me() {
    return apiClient.get<ApiSuccess<AuthResponse>>("/auth/me");
  }

  // Kept for explicit refresh calls; the client interceptor also calls this
  // internally via its own bare instance to avoid circular calls.
  static refreshToken() {
    return apiClient.post("/auth/refresh", {}, { withCredentials: true });
  }
}

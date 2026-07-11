import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { ApiSuccess } from "@/types/api.types";
import toast from "react-hot-toast";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// ---------------------------------------------------------------------------
// Primary client — all app requests go through here
// ---------------------------------------------------------------------------
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ---------------------------------------------------------------------------
// Refresh client — bare instance, no interceptors.
// Used exclusively inside the 401 interceptor below so we never create a
// refresh loop and avoid the circular-import problem of calling AuthService.
// ---------------------------------------------------------------------------
const refreshClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the httpOnly refresh-token cookie automatically
  timeout: 10_000,
});

// ---------------------------------------------------------------------------
// Queue-drain state — shared across all interceptor invocations
// ---------------------------------------------------------------------------
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function drainQueue(token: string | null, error?: unknown): void {
  refreshQueue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error)
  );
  refreshQueue = [];
}

// ---------------------------------------------------------------------------
// Error normalisation
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function toApiError(raw: unknown): ApiError {
  if (raw instanceof ApiError) return raw;
  const err = raw as AxiosError<{ message?: string; error?: string }>;
  toast.error(
    err.response?.data?.message ?? err.message ?? "An unexpected error occurred"
  );
  return new ApiError(
    err.response?.status ?? 0,
    err.response?.data?.message ??
    err.message ??
    "An unexpected error occurred",
    err.response?.data?.error
  );
}

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token from Zustand store
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — queue-drain token refresh on 401
//
// Flow:
//   Request fails with 401
//     → if first attempt: kick off one refresh, queue all other 401s
//     → on refresh success: update store, replay all queued requests
//     → on refresh failure: logout, redirect to /login, reject all queued
// ---------------------------------------------------------------------------
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const config = error.config as RetryConfig | undefined;

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = config?.url?.includes("/auth/refresh");
    const alreadyRetried = config?._retry;

    // Pass through: non-401s, failures on the refresh endpoint itself (avoids
    // infinite loops), requests that have already been retried, or cases where
    // Axios provides no config (e.g. network errors before the request left).
    if (!is401 || isRefreshEndpoint || alreadyRetried || !config) {
      return Promise.reject(toApiError(error));
    }

    config._retry = true;

    // A refresh is already in flight — queue this request and wait.
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) =>
        refreshQueue.push({ resolve, reject })
      )
        .then((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(config);
        })
        .catch((err) => Promise.reject(toApiError(err)));
    }

    // We are the first 401 — own the refresh.
    isRefreshing = true;

    try {
      const { data } = await refreshClient.post<
        ApiSuccess<{ accessToken: string }>
      >("/auth/refresh", {});

      const newToken = data.data.accessToken;

      // Persist the new token; keep the existing user object.
      const { user, login: storeLogin } = useAuthStore.getState();
      storeLogin(newToken, user!);

      drainQueue(newToken);
      config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(config);
    } catch (refreshError) {
      // Refresh token itself expired or was revoked — force logout.
      drainQueue(null, refreshError);
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(toApiError(refreshError));
    } finally {
      isRefreshing = false;
    }
  }
);

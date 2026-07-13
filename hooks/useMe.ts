"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthService } from "@/services/auth.service";
import { useApiQuery } from "./useApiQuery";
import { User } from "@/types/auth.types";
import { ApiSuccess } from "@/types/api.types";

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setUser = useAuthStore((s) => s.setUser);

  const query = useApiQuery<ApiSuccess<User>>({
    queryKey: ["auth", "me"],
    queryFn: () => AuthService.me().then((res) => res.data),
    enabled: hasHydrated && !!token,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.isSuccess && query.data?.data) {
      setUser(query.data.data);
    }
  }, [query.isSuccess, query.data, setUser]);

  return query;
}

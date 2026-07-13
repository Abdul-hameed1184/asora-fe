"use client";

import { useMe } from "@/hooks/useMe";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useMe();
  return <>{children}</>;
}

"use client";

/**
 * providers/QueryProvider.tsx
 *
 * Client-side wrapper that sets up the QueryClient and injects it via
 * QueryClientProvider.  Must be a Client Component because QueryClient
 * holds mutable state.
 *
 * Why a separate provider file?
 * ─────────────────────────────
 * Next.js app-router layouts are Server Components by default. We cannot
 * `"use client"` a layout that also fetches data server-side, so we extract
 * the provider into its own tiny Client Component and import it from the
 * Server Component layout.  This keeps the RSC boundary clean.
 */

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// QueryClient configuration
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      /**
       * Retry once (not the default 3) — reduces UX lag when a server is
       * actually down.  Individual queries can override this.
       */
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),

      /**
       * Refetch on window focus so that data opened in a background tab is
       * always fresh when the user returns.  Mutations that write on one tab
       * surface instantly on another.
       */
      refetchOnWindowFocus: true,

      /**
       * Don't refetch automatically when the component remounts — avoids
       * hammering the server during hot-module reload in dev.
       */
      refetchOnMount: true,

      /**
       * Show stale data while revalidating (background refetch pattern).
       * The UI should render existing data instantly, then silently update.
       */
      staleTime: 0,

      /**
       * Keep unused data in memory for 5 minutes.  If the user navigates
       * back to a page within 5 min, the cache is instantly restored.
       */
      gcTime: 5 * 60_000,
    },
    mutations: {
      /** Don't auto-retry mutations — writes are not idempotent by default. */
      retry: false,
    },
  },
};

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  /**
   * Create QueryClient inside useState so that each request gets its own
   * client in server-rendering (avoids sharing state between requests).
   */
  const [queryClient] = useState(() => new QueryClient(DEFAULT_CONFIG));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

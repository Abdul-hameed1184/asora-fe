"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "asora_recently_viewed";
const MAX_ITEMS = 8;

export function recordProductView(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    const next = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable or malformed — recently-viewed is best-effort only
  }
}

export function useRecentlyViewedIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setIds(raw ? JSON.parse(raw) : []);
    } catch {
      setIds([]);
    }
  }, []);

  return ids;
}

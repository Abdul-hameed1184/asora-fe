"use client";

import { cn } from "@/lib/utils";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdminSettings";
import { ErrorState } from "@/components/ui/ErrorState";
import type { AdminSettings } from "@/types/adminSettings.types";

const TOGGLES: { field: keyof Omit<AdminSettings, "id" | "updatedAt">; label: string; desc: string }[] = [
  {
    field: "mailUsersOnNewArrival",
    label: "New Arrivals",
    desc: "Email subscribed customers whenever a new collection or product is published.",
  },
  {
    field: "mailUsersOnRestock",
    label: "Restocks",
    desc: "Email subscribed customers whenever an out-of-stock product is restocked.",
  },
  {
    field: "mailUsersOnNewCoupon",
    label: "New Coupons",
    desc: "Notify subscribed customers whenever a new coupon becomes available.",
  },
];

export default function MarketingSettingsPanel() {
  const { data: settings, isPending, isError, refetch } = useAdminSettings();
  const { mutate: updateSettings, variables, isPending: isSaving } = useUpdateAdminSettings();

  if (isError) {
    return (
      <div className="bg-white border border-border shadow-sm">
        <ErrorState title="Could not load marketing settings" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border shadow-sm">
      <div className="px-8 py-6 border-b border-border">
        <h2 className="font-garamound text-xl font-bold text-zinc-950">
          Marketing Notifications
        </h2>
        <p className="text-xs font-courier text-zinc-500 mt-1">
          Platform-wide toggles. When enabled, eligible customers (per their own
          notification preferences) are queued for an email — always asynchronously.
        </p>
      </div>

      <div className="divide-y divide-border">
        {TOGGLES.map((toggle) => {
          const current = isPending ? undefined : settings?.[toggle.field] ?? true;
          const savingThis = isSaving && toggle.field in (variables ?? {});

          return (
            <div
              key={toggle.field}
              className="flex items-center justify-between gap-6 px-8 py-6"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">{toggle.label}</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-md">{toggle.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => updateSettings({ [toggle.field]: !current })}
                disabled={isPending || savingThis}
                className={cn(
                  "w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center flex-shrink-0 disabled:opacity-40",
                  current ? "bg-[#C99A36]" : "bg-zinc-300"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 block",
                    current ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

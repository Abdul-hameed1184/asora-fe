import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Full, untruncated value shown on hover — useful when `value` is compacted for space */
  title?: string;
  footer: string;
  icon: LucideIcon;
  isLoading?: boolean;
}

export function StatCard({ label, value, title, footer, icon: Icon, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="border border-border p-6 flex flex-col gap-2 bg-white shadow-sm animate-pulse">
        <div className="h-3 w-2/3 bg-zinc-100 rounded" />
        <div className="h-8 w-1/2 bg-zinc-100 rounded mt-2" />
        <div className="flex justify-between mt-5 pt-4 border-t border-zinc-100">
          <div className="h-5 w-5 bg-zinc-100 rounded-full" />
          <div className="h-3 w-16 bg-zinc-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-border p-6 flex flex-col gap-2 bg-white shadow-sm min-w-0")}>
      <p className="mt-1 text-xs tracking-[2px] uppercase text-[#D2C5B1] font-semibold font-courier truncate">
        {label}
      </p>
      <p
        title={title}
        className="font-garamound text-2xl font-medium text-zinc-900 mt-1 truncate"
      >
        {value}
      </p>
      <div className="flex justify-between items-center mt-5 pt-4 border-t border-zinc-100">
        <Icon size={20} className="text-[#C99A36] flex-shrink-0" />
        <p className="text-zinc-500 text-xs truncate">{footer}</p>
      </div>
    </div>
  );
}

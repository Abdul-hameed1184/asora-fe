"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: FilterSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none bg-white border border-border pl-5 pr-10 py-2.5 text-xs font-courier font-bold uppercase tracking-wider transition-colors focus:outline-none focus:border-[#C99A36] cursor-pointer",
          value ? "text-zinc-900 border-[#E9DFCE]" : "text-zinc-600 hover:border-zinc-400"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
      />
    </div>
  );
}

"use client";

interface PageSizeSelectProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export function PageSizeSelect({
  value,
  onChange,
  options = [10, 20, 50],
}: PageSizeSelectProps) {
  return (
    <label className="flex items-center gap-2 text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
      <span>Show</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-white border border-border text-zinc-700 text-xs font-courier font-bold px-2 py-1.5 focus:outline-none focus:border-[#C99A36] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span>per page</span>
    </label>
  );
}

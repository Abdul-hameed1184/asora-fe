"use client";

import { useEffect, useState } from "react";

function getRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function FlashSaleCountdown({ targetDate }: { targetDate: Date }) {
  const [remaining, setRemaining] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    setRemaining(getRemaining(targetDate));
    const interval = setInterval(() => setRemaining(getRemaining(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Hours", value: remaining?.hours ?? 0 },
    { label: "Minutes", value: remaining?.minutes ?? 0 },
    { label: "Seconds", value: remaining?.seconds ?? 0 },
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-2 text-xs uppercase tracking-widest text-gray-300">{unit.label}</p>
        </div>
      ))}
    </div>
  );
}

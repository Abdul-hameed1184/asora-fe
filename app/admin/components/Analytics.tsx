import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Analytics() {
  return (
    <div className="grid md:grid-cols-3 grid-cols-1 gap-6 mt-10">
      {/* Revenue Over Time Chart */}
      <div className="md:col-span-2 border border-border p-8 bg-white flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h3 className="text-lg font-courier font-bold uppercase tracking-[2px] text-zinc-900">
              REVENUE OVER TIME
            </h3>
            <p className="text-xs text-zinc-400 font-courier tracking-wider mt-1">
              MONTHLY PERFORMANCE TRACKING
            </p>
          </div>
          {/* Legend */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C99A36]" />
              <span className="text-[11px] font-courier font-bold uppercase tracking-wider text-zinc-500">
                READY-MADE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
              <span className="text-[11px] font-courier font-bold uppercase tracking-wider text-zinc-500">
                BESPOKE
              </span>
            </div>
          </div>
        </div>

        {/* SVG Spline Chart */}
        <div className="w-full h-[280px] relative mt-2">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 300"
            preserveAspectRatio="none"
          >
            {/* Grid Lines (horizontal) */}
            <line x1="40" y1="50" x2="570" y2="50" stroke="#F1EFEA" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="125" x2="570" y2="125" stroke="#F1EFEA" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="200" x2="570" y2="200" stroke="#F1EFEA" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="275" x2="570" y2="275" stroke="#E6E3DC" strokeWidth="1" />

            {/* Ready-made Line (Gold Solid Curve) */}
            <path
              d="M 50 230 C 100 230, 120 190, 150 210 C 190 235, 220 280, 250 270 C 280 260, 320 230, 350 200 C 390 160, 420 120, 450 95 C 485 65, 520 20, 550 40 C 560 48, 565 65, 570 95"
              fill="none"
              stroke="#C99A36"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Bespoke Line (Black Dashed Curve) */}
            <path
              d="M 50 275 C 90 250, 120 215, 150 210 C 180 205, 220 185, 250 190 C 280 195, 320 205, 350 200 C 380 195, 420 180, 450 170 C 480 160, 520 135, 550 120"
              fill="none"
              stroke="#18181b"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          </svg>

          {/* Month Labels under chart */}
          <div className="flex justify-between items-center px-[35px] mt-2 text-[11px] font-courier font-bold uppercase tracking-wider text-zinc-400">
            <span>MAY</span>
            <span>JUN</span>
            <span>JUL</span>
            <span>AUG</span>
            <span>SEP</span>
            <span>OCT</span>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="border border-border p-8 bg-white flex flex-col justify-between shadow-sm">
        <div>
          <h3 className="text-xl font-garamound font-bold text-zinc-900">
            TOP CATEGORIES
          </h3>

          <div className="mt-8 space-y-6">
            {/* Category 1 */}
            <div>
              <div className="flex justify-between items-center text-xs font-courier tracking-wider text-zinc-500 font-bold mb-2">
                <span>ANKARA BESPOKE</span>
                <span className="text-zinc-900 font-sans text-sm font-semibold">₦1.8M</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#EBE8E2]">
                <div className="h-full bg-[#C99A36]" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Category 2 */}
            <div>
              <div className="flex justify-between items-center text-xs font-courier tracking-wider text-zinc-500 font-bold mb-2">
                <span>CORPORATE WEAR</span>
                <span className="text-zinc-900 font-sans text-sm font-semibold">₦1.2M</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#EBE8E2]">
                <div className="h-full bg-[#826224]" style={{ width: '60%' }} />
              </div>
            </div>

            {/* Category 3 */}
            <div>
              <div className="flex justify-between items-center text-xs font-courier tracking-wider text-zinc-500 font-bold mb-2">
                <span>AGBADA COLLECTION</span>
                <span className="text-zinc-900 font-sans text-sm font-semibold">₦0.9M</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#EBE8E2]">
                <div className="h-full bg-[#9E907B]" style={{ width: '45%' }} />
              </div>
            </div>

            {/* Category 4 */}
            <div>
              <div className="flex justify-between items-center text-xs font-courier tracking-wider text-zinc-500 font-bold mb-2">
                <span>LOUNGE WEAR</span>
                <span className="text-zinc-900 font-sans text-sm font-semibold">₦0.3M</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#EBE8E2]">
                <div className="h-full bg-[#52525B]" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/admin/categories"
          className="text-xs font-courier font-bold uppercase tracking-wider text-[#C99A36] hover:text-[#B0852E] flex items-center gap-1.5 transition-colors mt-8 pt-4 border-t border-zinc-100"
        >
          <span>FULL CATEGORY REPORT</span>
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  )
}

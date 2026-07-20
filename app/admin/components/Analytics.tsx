"use client";

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  TrendingUp,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart3,
  Package,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  DashboardMonthlySales,
  DashboardTopProduct,
} from '@/types/analytics.types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Palette — validated for CVD-safe adjacent separation (dataviz skill).
// Sequential/single-series charts use the brand gold accent; the status
// donut is the only place identity must be distinguished, so it gets the
// categorical set.
// ---------------------------------------------------------------------------
const BRAND_GOLD = '#C99A36';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#eda100',
  PROCESSING: '#eb6834',
  SHIPPED: '#2a78d6',
  DELIVERED: '#1baf7a',
  CANCELLED: '#e34948',
};
const STATUS_FALLBACK_COLORS = ['#4a3aa7', '#e87ba4', '#008300'];

function colorForStatus(status: string, index: number): string {
  return STATUS_COLORS[status] ?? STATUS_FALLBACK_COLORS[index % STATUS_FALLBACK_COLORS.length];
}

function formatStatusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
export function formatNaira(value: number, compact = false): string {
  if (compact) {
    return `₦${new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)}`;
  }
  return `₦${value.toLocaleString()}`;
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  if (!year || !m) return month;
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
}

// ---------------------------------------------------------------------------
// Shared tooltip — matches the site's card chrome (white, hairline border)
// ---------------------------------------------------------------------------
interface ChartTooltipEntry {
  value: number;
  name?: string;
  color?: string;
  payload?: { color?: string };
}

function ChartTooltip({
  active,
  label,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  label?: string;
  payload?: ChartTooltipEntry[];
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-border shadow-sm px-4 py-3">
      {label && (
        <p className="text-[11px] font-courier font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color ?? entry.payload?.color }}
            />
            <span className="text-sm font-sans text-zinc-900 font-medium">
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state — reused across all four chart panels
// ---------------------------------------------------------------------------
function ChartEmptyState({
  icon: Icon,
  message,
  description,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  message: string;
  description?: string;
}) {
  return (
    <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
        <Icon size={22} className="text-zinc-300" />
      </div>
      <div>
        <p className="font-garamound text-base font-bold text-zinc-900">{message}</p>
        {description && (
          <p className="text-xs font-courier text-zinc-400 mt-1 max-w-xs">{description}</p>
        )}
      </div>
    </div>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-zinc-100 rounded animate-pulse', className)} />
  );
}

// ---------------------------------------------------------------------------
// Analytics — real dashboard charts, powered by /analytics/dashboard
// ---------------------------------------------------------------------------
interface AnalyticsProps {
  monthlySales: DashboardMonthlySales[];
  ordersByStatus: Record<string, number>;
  topProducts: DashboardTopProduct[];
  isLoading?: boolean;
}

export function Analytics({ monthlySales, ordersByStatus, topProducts, isLoading }: AnalyticsProps) {
  const salesData = monthlySales.map((m) => ({
    ...m,
    label: formatMonthLabel(m.month),
  }));

  const statusData = Object.entries(ordersByStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count], i) => ({
      status,
      label: formatStatusLabel(status),
      count,
      color: colorForStatus(status, i),
    }));
  const totalStatusOrders = statusData.reduce((sum, s) => sum + s.count, 0);

  const rankedProducts = [...topProducts]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 mt-10">
      {/* Row 1 — Revenue trend + Orders by status */}
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
        {/* Revenue Over Time */}
        <div className="lg:col-span-2 border border-border p-6 sm:p-8 bg-white flex flex-col gap-6 shadow-sm min-w-0">
          <div>
            <h3 className="text-lg font-courier font-bold uppercase tracking-[2px] text-zinc-900">
              Revenue Over Time
            </h3>
            <p className="text-xs text-zinc-400 font-courier tracking-wider mt-1">
              MONTHLY PERFORMANCE TRACKING
            </p>
          </div>

          {isLoading ? (
            <ChartSkeleton className="w-full h-[260px] sm:h-[280px]" />
          ) : salesData.length === 0 ? (
            <ChartEmptyState
              icon={LineChartIcon}
              message="No sales recorded yet"
              description="Revenue will start plotting here once your first order is paid."
            />
          ) : (
            <div className="w-full h-[260px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND_GOLD} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={BRAND_GOLD} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={{ stroke: '#E6E3DC' }}
                    tickLine={false}
                    tick={{ fontSize: 11, fontFamily: 'var(--font-courier)', fill: '#a1a1aa' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tick={{ fontSize: 11, fontFamily: 'var(--font-courier)', fill: '#a1a1aa' }}
                    tickFormatter={(v) => formatNaira(v, true)}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip valueFormatter={(v) => formatNaira(v)} />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    name="Revenue"
                    stroke={BRAND_GOLD}
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                    dot={{ r: 3, fill: BRAND_GOLD, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="border border-border p-6 sm:p-8 bg-white flex flex-col shadow-sm min-w-0">
          <h3 className="text-lg font-courier font-bold uppercase tracking-[2px] text-zinc-900">
            Orders by Status
          </h3>
          <p className="text-xs text-zinc-400 font-courier tracking-wider mt-1">
            CURRENT ORDER PIPELINE
          </p>

          {isLoading ? (
            <div className="mt-4 flex flex-col items-center gap-6">
              <ChartSkeleton className="w-[160px] h-[160px] rounded-full" />
              <div className="w-full space-y-3">
                {[...Array(4)].map((_, i) => (
                  <ChartSkeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ) : statusData.length === 0 ? (
            <ChartEmptyState
              icon={PieChartIcon}
              message="No orders yet"
              description="The status breakdown appears once orders start coming in."
            />
          ) : (
            <>
              <div className="w-full h-[180px] mt-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="100%"
                      paddingAngle={2}
                      stroke="#fcfcfb"
                      strokeWidth={2}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <ChartTooltip
                          valueFormatter={(v) => `${v} order${v === 1 ? '' : 's'}`}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-garamound text-2xl font-medium text-zinc-900">
                    {totalStatusOrders}
                  </span>
                  <span className="text-[10px] font-courier uppercase tracking-wider text-zinc-400">
                    Total
                  </span>
                </div>
              </div>

              {/* Direct labels — satisfies the relief rule for low-contrast slots */}
              <ul className="mt-6 space-y-3">
                {statusData.map((entry) => (
                  <li key={entry.status} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-[11px] font-courier font-bold uppercase tracking-wider text-zinc-500 truncate">
                        {entry.label}
                      </span>
                    </div>
                    <span className="text-sm font-sans font-semibold text-zinc-900 flex-shrink-0">
                      {entry.count}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Row 2 — Orders volume trend + Top products */}
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
        {/* Orders Volume */}
        <div className="border border-border p-6 sm:p-8 bg-white flex flex-col gap-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-courier font-bold uppercase tracking-[2px] text-zinc-900">
                Orders Volume
              </h3>
              <p className="text-xs text-zinc-400 font-courier tracking-wider mt-1">
                ORDERS PLACED PER MONTH
              </p>
            </div>
            <TrendingUp size={18} className="text-[#C99A36]" />
          </div>

          {isLoading ? (
            <ChartSkeleton className="w-full h-[220px]" />
          ) : salesData.length === 0 ? (
            <ChartEmptyState
              icon={BarChart3}
              message="No sales recorded yet"
              description="Monthly order volume will appear here once orders start coming in."
            />
          ) : (
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={{ stroke: '#E6E3DC' }}
                    tickLine={false}
                    tick={{ fontSize: 11, fontFamily: 'var(--font-courier)', fill: '#a1a1aa' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fontFamily: 'var(--font-courier)', fill: '#a1a1aa' }}
                  />
                  <Tooltip
                    cursor={{ fill: '#FAF9F6' }}
                    content={
                      <ChartTooltip
                        valueFormatter={(v) => `${v} order${v === 1 ? '' : 's'}`}
                      />
                    }
                  />
                  <Bar dataKey="totalOrders" name="Orders" fill={BRAND_GOLD} radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="border border-border p-6 sm:p-8 bg-white flex flex-col shadow-sm min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-courier font-bold uppercase tracking-[2px] text-zinc-900">
              Top Products
            </h3>
          </div>
          <p className="text-xs text-zinc-400 font-courier tracking-wider mt-1">
            RANKED BY UNITS SOLD
          </p>

          {isLoading ? (
            <ChartSkeleton className="w-full h-[220px] mt-2" />
          ) : rankedProducts.length === 0 ? (
            <ChartEmptyState
              icon={Package}
              message="No product sales yet"
              description="Your best sellers will be ranked here once units start selling."
            />
          ) : (
            <div className="w-full h-[220px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankedProducts}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontFamily: 'var(--font-courier)', fill: '#a1a1aa' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={110}
                    tick={{ fontSize: 11, fontFamily: 'var(--font-courier)', fill: '#52525b' }}
                    tickFormatter={(name: string) =>
                      name.length > 16 ? `${name.slice(0, 15)}…` : name
                    }
                  />
                  <Tooltip
                    cursor={{ fill: '#FAF9F6' }}
                    content={
                      <ChartTooltip
                        valueFormatter={(v) => `${v} unit${v === 1 ? '' : 's'} sold`}
                      />
                    }
                  />
                  <Bar dataKey="soldCount" name="Units sold" fill={BRAND_GOLD} radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <Link
            href="/admin/inventory"
            className="text-xs font-courier font-bold uppercase tracking-wider text-[#C99A36] hover:text-[#B0852E] flex items-center gap-1.5 transition-colors mt-6 pt-4 border-t border-zinc-100"
          >
            <span>Full product report</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}

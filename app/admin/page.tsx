"use client";

import { Button } from '@/components/ui/button'
import {
  Plus,
  Wallet,
  Wallet2,
  Users,
  Package,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Table, Column } from './components/Table'
import { Analytics, formatNaira } from './components/Analytics'
import { StatCard } from './components/StatCard'
import ProductDrawer from './components/ProductDrawer'
import { cn } from '@/lib/utils'
import { useDashboardAnalytics } from '@/hooks/useAnalytics'
import { useProductDrawerStore } from '@/lib/stores/useProductDrawerStore'
import type { DashboardRecentOrder } from '@/types/analytics.types'

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
  PROCESSING: "bg-[#FAF4EB] text-[#A67C37] border border-[#E9DFCE]",
  SHIPPED: "bg-blue-50 text-blue-700 border border-blue-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  CANCELLED: "bg-red-50 text-[#C23A3A] border border-red-100",
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

const RECENT_ORDERS_LIMIT = 5;

const Page = () => {
  const { data, isPending, isFetching, isError, error, refetch } = useDashboardAnalytics();
  const { openNew } = useProductDrawerStore();

  const overview = data?.overview;
  const isBackgroundRefetch = isFetching && !isPending;
  // Backend already returns recentOrders sorted newest-first — take the last 5 (most recent).
  const recentOrders = (data?.recentOrders ?? []).slice(0, RECENT_ORDERS_LIMIT);

  const columns: Column<DashboardRecentOrder>[] = [
    {
      header: 'ORDER',
      className: 'font-sans text-lg font-medium text-zinc-900 align-middle',
      render: (row) => row.orderNumber,
    },
    {
      header: 'CUSTOMER',
      className: 'align-middle',
      render: (row) => (
        <div className="flex flex-col text-sm font-sans">
          <span className="text-zinc-900">
            {row.user.firstName} {row.user.lastName}
          </span>
          <span className="text-xs text-zinc-400">{row.user.email}</span>
        </div>
      ),
    },
    {
      header: 'DATE',
      className: 'align-middle',
      render: (row) => {
        const { day, time } = formatDate(row.createdAt);
        return (
          <div className="flex flex-col text-sm text-zinc-500 font-sans">
            <span>{day}</span>
            <span>{time}</span>
          </div>
        );
      },
    },
    {
      header: 'STATUS',
      className: 'align-middle',
      render: (row) => (
        <span
          className={cn(
            "inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider text-center",
            STATUS_BADGE[row.orderStatus] ?? "bg-zinc-100 text-zinc-600 border border-zinc-200"
          )}
        >
          {row.orderStatus}
        </span>
      ),
    },
    {
      header: 'VALUE',
      className: 'font-sans text-lg font-semibold text-zinc-900 align-middle',
      render: (row) => `₦${row.totalAmount.toLocaleString()}`,
    },
    {
      header: 'ACTION',
      headerClassName: 'text-right pr-8',
      className: 'text-right pr-8 align-middle',
      hideOnMobile: true,
      render: () => (
        <div className="flex justify-end">
          <ChevronRight size={20} className="text-zinc-400" />
        </div>
      ),
    },
  ];

  return (
    <div className='max-w-7xl pt-7 mx-auto px-6 md:px-10 pb-16'>
      <section className='flex flex-col sm:flex-row gap-4 justify-between sm:items-center mx-auto py-5'>
        <div className="flex flex-col gap-2">
          <h1 className='text-4xl text-foreground font-serif'>Hello, Admin</h1>
          <p className='text-zinc-500'>Welcome back to your curated space.</p>
        </div>

        <Button
          onClick={openNew}
          className='bg-primary text-tertiary hover:bg-primary/90 rounded-full px-6 py-5 text-md font-medium transition-all duration-300'
        >
          <Plus size={18} />
          Add New Product
        </Button>
      </section>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {isError && !isPending && (
        <div className="mt-2 border border-red-100 bg-red-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-[#C23A3A] flex-shrink-0" />
            <p className="text-sm text-[#C23A3A]">
              {(error as Error)?.message ?? 'Could not load dashboard analytics.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-courier font-bold uppercase tracking-wider text-[#C23A3A] border border-[#C23A3A]/40 hover:border-[#C23A3A] px-4 py-2 transition-colors flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Overview stat cards ──────────────────────────────────────────── */}
      <section
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mt-4 transition-opacity duration-200",
          isBackgroundRefetch && "opacity-70"
        )}
      >
        <StatCard
          isLoading={isPending}
          label="TOTAL REVENUE"
          value={formatNaira(overview?.totalRevenue ?? 0, true)}
          title={`₦${(overview?.totalRevenue ?? 0).toLocaleString()}`}
          footer="Lifetime"
          icon={Wallet}
        />
        <StatCard
          isLoading={isPending}
          label="TOTAL ORDERS"
          value={(overview?.totalOrders ?? 0).toLocaleString()}
          footer={`${overview?.paidOrdersCount ?? 0} paid`}
          icon={Wallet2}
        />
        <StatCard
          isLoading={isPending}
          label="PAID ORDERS"
          value={(overview?.paidOrdersCount ?? 0).toLocaleString()}
          footer="Completed"
          icon={CheckCircle2}
        />
        <StatCard
          isLoading={isPending}
          label="CUSTOMERS"
          value={(overview?.totalCustomers ?? 0).toLocaleString()}
          footer="Registered"
          icon={Users}
        />
        <StatCard
          isLoading={isPending}
          label="PRODUCTS"
          value={(overview?.totalProducts ?? 0).toLocaleString()}
          footer="In catalog"
          icon={Package}
        />
      </section>

      {/* Analytics Graph & Categories Section */}
      <Analytics
        isLoading={isPending}
        monthlySales={data?.monthlySales ?? []}
        ordersByStatus={data?.ordersByStatus ?? {}}
        topProducts={data?.topProducts ?? []}
      />

      {/* Recent Orders Table Section */}
      <section className='mt-10'>
        <Table
          title="Recent Orders"
          actionLabel="View all"
          actionHref="/admin/orders"
          columns={columns}
          data={recentOrders}
          isLoading={isPending}
          emptyMessage="No orders yet"
          emptyDescription="Orders will show up here as soon as customers start checking out."
        />
      </section>

      {/* Drawer — driven by Zustand UI state; data mutations go through TQ */}
      <ProductDrawer />
    </div>
  )
}

export default Page

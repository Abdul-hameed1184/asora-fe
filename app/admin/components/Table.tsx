import React from 'react'
import Link from 'next/link'
import { PackageOpen, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
  /** Omit this column from the stacked mobile card view (e.g. purely decorative columns). */
  hideOnMobile?: boolean;
}

interface TableProps<T> {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
}

export function Table<T>({
  title,
  actionLabel,
  actionHref,
  columns,
  data,
  onRowClick,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyMessage = "No records yet",
  emptyDescription,
  emptyIcon = PackageOpen,
}: TableProps<T>) {
  const mobileColumns = columns.filter((column) => !column.hideOnMobile);

  return (
    <div className="w-full bg-white border border-border shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="flex justify-between items-center px-6 sm:px-8 py-6 border-b border-border">
        <h2 className="text-2xl font-garamound text-[#18181b] font-medium">{title}</h2>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="text-lg font-garamound text-[#C99A36] hover:text-[#B0852E] underline underline-offset-4 decoration-[#C99A36]/60 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      {isError ? (
        <ErrorState
          title={`Could not load ${title.toLowerCase()}`}
          message={errorMessage}
          onRetry={onRetry ?? (() => window.location.reload())}
        />
      ) : (
        <>
          {/* Desktop / tablet table (lg and up) */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-white">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={cn(
                        "px-8 py-5 text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500",
                        column.headerClassName
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(4)].map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-border last:border-b-0 animate-pulse">
                      {columns.map((_, colIndex) => (
                        <td key={colIndex} className="px-8 py-6">
                          <div className="h-4 bg-zinc-100 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="p-0">
                      <EmptyState icon={emptyIcon} title={emptyMessage} description={emptyDescription} />
                    </td>
                  </tr>
                ) : (
                  data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        "border-b border-border hover:bg-zinc-50/50 transition-colors last:border-b-0",
                        onRowClick && "cursor-pointer"
                      )}
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={cn(
                            "px-8 py-6 text-sm text-[#18181b]",
                            column.className
                          )}
                        >
                          {column.render
                            ? column.render(row)
                            : column.accessorKey
                            ? String(row[column.accessorKey])
                            : null}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet stacked cards (below lg) */}
          <div className="lg:hidden">
            {isLoading ? (
              <div className="divide-y divide-border">
                {[...Array(3)].map((_, rowIndex) => (
                  <div key={rowIndex} className="px-6 py-5 space-y-3 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-4 bg-zinc-100 rounded w-full" />
                    ))}
                  </div>
                ))}
              </div>
            ) : data.length === 0 ? (
              <EmptyState icon={emptyIcon} title={emptyMessage} description={emptyDescription} />
            ) : (
              <div className="divide-y divide-border">
                {data.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "px-6 py-5 space-y-3",
                      onRowClick && "cursor-pointer active:bg-zinc-50"
                    )}
                  >
                    {mobileColumns.map((column, colIndex) => (
                      <div key={colIndex} className="flex items-start justify-between gap-4">
                        <span className="text-[10px] font-courier font-bold uppercase tracking-wider text-zinc-400 pt-0.5 flex-shrink-0">
                          {column.header}
                        </span>
                        <div className="text-sm text-[#18181b] text-right">
                          {column.render
                            ? column.render(row)
                            : column.accessorKey
                            ? String(row[column.accessorKey])
                            : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

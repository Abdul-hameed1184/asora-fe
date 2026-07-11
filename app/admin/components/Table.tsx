import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  title,
  actionLabel,
  actionHref,
  columns,
  data,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="w-full bg-white border border-border shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-border">
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

      {/* Responsive Table Wrapper */}
      <div className="w-full overflow-x-auto">
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
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                // onClick={() => onRowClick?.(row)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

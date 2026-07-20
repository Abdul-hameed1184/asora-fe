import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("py-16 sm:py-20 flex flex-col items-center gap-4 text-center px-6 sm:px-8", className)}>
      <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
        <Icon size={22} className="text-zinc-300" />
      </div>
      <div>
        <p className="font-garamound text-lg font-bold text-zinc-900">{title}</p>
        {description && (
          <p className="text-xs font-courier text-zinc-400 mt-1 max-w-sm">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 bg-[#C99A36] hover:bg-[#B0852E] text-white flex items-center gap-2 px-5 py-2.5 text-xs font-courier font-bold uppercase tracking-wider transition-colors"
        >
          {ActionIcon && <ActionIcon size={14} />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

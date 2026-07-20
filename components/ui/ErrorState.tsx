import { AlertCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  icon: Icon = AlertCircle,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("py-16 sm:py-20 flex flex-col items-center gap-4 text-center px-6 sm:px-8", className)}>
      <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
        <Icon size={22} className="text-[#C23A3A]" />
      </div>
      <div>
        <p className="font-garamound text-lg font-bold text-zinc-900">{title}</p>
        <p className="text-xs font-courier text-zinc-400 mt-1 max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="mt-2 text-xs font-courier font-bold uppercase tracking-wider text-[#C99A36] hover:text-[#B0852E] border border-[#C99A36]/40 hover:border-[#C99A36] px-4 py-2 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

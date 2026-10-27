"use client";

import { cn } from "@/components/ui/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icone,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className,
      )}
    >
      {Icone && <Icone className="w-12 h-12 text-slate-300 mb-4" />}
      <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#00D26A] hover:brightness-95 text-white font-semibold px-4 py-3 rounded-lg min-h-11"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
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
        "flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center",
        className,
      )}
    >
      {Icone && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icone className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#2F6BFF] px-4 text-sm font-semibold text-white transition-opacity active:opacity-80"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

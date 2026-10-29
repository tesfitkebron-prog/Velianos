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
        "flex flex-col items-center justify-center rounded-[24px] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
        className,
      )}
    >
      {Icone && (
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icone className="h-8 w-8" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-base font-medium leading-relaxed text-slate-600">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex min-h-16 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-base font-extrabold text-white shadow-lg shadow-emerald-600/40 transition-transform duration-200 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

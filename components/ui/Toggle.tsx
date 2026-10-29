import { cn } from "@/components/ui/utils";

interface ToggleProps {
  actif: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  actif,
  onClick,
  label,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-16 w-28 flex-shrink-0 items-center rounded-full p-1 transition-colors duration-200 active:scale-95 disabled:opacity-50",
        actif ? "bg-emerald-500" : "bg-slate-300",
        className,
      )}
    >
      <span
        className={cn(
          "block h-14 w-14 rounded-full bg-white shadow-md transition-transform duration-200",
          actif ? "translate-x-[48px]" : "translate-x-0",
        )}
      />
    </button>
  );
}

export default Toggle;

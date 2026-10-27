import { cn } from "@/components/ui/utils";

interface ToggleProps {
  actif: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

export function Toggle({ actif, onClick, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "w-11 h-6 rounded-full p-0.5 flex-shrink-0 transition-colors",
        actif ? "bg-slate-900" : "bg-slate-300",
        className,
      )}
    >
      <span
        className={cn(
          "block w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
          actif ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export default Toggle;
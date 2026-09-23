import { cn } from "@/components/ui/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function Spinner({ size = 24, className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-border border-t-primary",
        className,
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Chargement..."
      {...props}
    >
      <span className="sr-only">Chargement en cours</span>
    </div>
  );
}

export default Spinner;

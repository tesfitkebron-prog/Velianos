import { cn } from "@/components/ui/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "nova";
}

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-sm",
        variant === "nova" && "border-slate-900 bg-slate-900 text-white shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;

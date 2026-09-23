import { cn } from "@/components/ui/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "nova";
}

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md",
        variant === "nova" && "bg-nova border-nova text-white shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;

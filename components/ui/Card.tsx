import { cn } from "@/components/ui/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "nova";
}

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-6 shadow-sm",
        variant === "nova" && "border-blue-600 bg-blue-600 text-white shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;

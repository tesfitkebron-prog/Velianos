import { Loader2 } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "nuit";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-600",
  nuit: "bg-[#0A2540] text-white shadow-lg shadow-[#0A2540]/25 hover:bg-[#12365c]",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-12 px-4 text-base",
  md: "h-14 px-5 text-base",
  lg: "h-16 px-6 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  loading,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold tracking-tight transition-transform duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export default Button;

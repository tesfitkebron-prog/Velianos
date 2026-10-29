import { cn } from "@/components/ui/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "nuit";
}

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
        variant === "nuit" && "bg-[#2F6BFF] text-white",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;

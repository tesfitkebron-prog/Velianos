import { cn } from "@/components/ui/utils";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-12")}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background mb-6">
        <AlertCircle className="h-10 w-10 text-text-secondary" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-base text-text-secondary mb-6 text-center max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;

"use client";

import { cn } from "@/components/ui/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-slate-200 animate-pulse rounded", className)} />;
}

export default Skeleton;
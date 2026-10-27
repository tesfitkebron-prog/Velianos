"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center bg-white px-1">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Retour"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-slate-600 transition-all active:scale-95 active:bg-slate-100"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <h1 className="min-w-0 flex-1 truncate px-2 text-center text-base font-bold text-slate-900">
        {title}
      </h1>
      <span className="h-11 w-11 flex-shrink-0" aria-hidden="true" />
    </header>
  );
}

export default PageHeader;

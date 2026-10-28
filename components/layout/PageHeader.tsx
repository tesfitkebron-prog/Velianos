"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Retour"
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-slate-700 transition-transform duration-200 active:scale-95 active:bg-slate-100"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={2.25} />
      </button>
      <h1 className="min-w-0 flex-1 truncate px-2 text-center text-lg font-extrabold tracking-tight text-slate-900">
        {title}
      </h1>
      <span className="h-12 w-12 flex-shrink-0" aria-hidden="true" />
    </div>
  );
}

export default PageHeader;

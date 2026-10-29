"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cheminParent } from "@/lib/navigation";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const repli = cheminParent(pathname);

  const retour = () => {
    if (repli && typeof window !== "undefined" && window.history.length <= 1) {
      router.replace(repli);
      return;
    }
    router.back();
  };

  return (
    <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-2">
      <button
        type="button"
        onClick={retour}
        aria-label="Retour"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors active:bg-slate-100"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
      </button>
      <h1 className="min-w-0 flex-1 truncate px-2 text-center text-base font-semibold text-slate-900">
        {title}
      </h1>
      <span className="h-10 w-10 flex-shrink-0" aria-hidden="true" />
    </div>
  );
}

export default PageHeader;

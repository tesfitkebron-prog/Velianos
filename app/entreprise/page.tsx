import { AppLayout } from "@/components/layout/AppLayout";

export default function EntreprisePage() {
  return (
    <AppLayout>
      <div className="w-full">
        <h1 className="text-2xl font-bold text-slate-900">Mon entreprise</h1>
        <p className="text-sm text-slate-500 mt-1">
          Les informations que votre assistant utilise pour répondre.
        </p>

        <div className="mt-6 p-12 rounded-xl border border-slate-200 bg-white text-center">
          <p className="text-base font-bold text-slate-900">Bientôt disponible</p>
          <p className="text-sm text-slate-500 mt-1">
            Cette page arrive dans une prochaine version.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
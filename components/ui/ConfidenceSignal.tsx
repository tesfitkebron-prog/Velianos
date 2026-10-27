"use client";

export type Confiance = "sur" | "verifier" | "besoin";

const styles: Record<Confiance, { pastille: string; texte: string; fond: string }> = {
  sur: { pastille: "bg-blue-500", texte: "Sûr", fond: "bg-blue-100 text-blue-700" },
  verifier: {
    pastille: "bg-orange-500",
    texte: "À vérifier",
    fond: "bg-orange-100 text-orange-700",
  },
  besoin: {
    pastille: "bg-red-500",
    texte: "Besoin de vous",
    fond: "bg-red-100 text-red-700",
  },
};

export function ConfidenceSignal({
  niveau,
  libelle,
}: {
  niveau: Confiance;
  libelle?: string;
}) {
  const style = styles[niveau];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${style.fond}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.pastille}`} />
      {libelle ?? style.texte}
    </span>
  );
}

export default ConfidenceSignal;
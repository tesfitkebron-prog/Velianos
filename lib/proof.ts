"use client";

import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export type PreuveIntervention = {
  photo?: string;
  signature?: string;
  photoPath?: string;
  signaturePath?: string;
  updatedAt: string;
};

const CLE = "velianos_preuves_intervention";

function lireTout(): Record<string, PreuveIntervention> {
  if (typeof window === "undefined") return {};
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return {};
    const valeur: unknown = JSON.parse(brut);
    if (!valeur || typeof valeur !== "object") return {};
    return valeur as Record<string, PreuveIntervention>;
  } catch {
    return {};
  }
}

function ecrireTout(preuves: Record<string, PreuveIntervention>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(preuves));
    window.dispatchEvent(new Event("velianos:preuves"));
  } catch {
    // Le stockage local est plein ou indisponible.
  }
}

export function lirePreuve(clientId: string): PreuveIntervention | null {
  if (!clientId) return null;
  return lireTout()[clientId] ?? null;
}

export function enregistrerPreuve(
  clientId: string,
  preuve: PreuveIntervention,
): void {
  const toutes = lireTout();
  toutes[clientId] = preuve;
  ecrireTout(toutes);
}

export function supprimerPreuve(clientId: string): void {
  const toutes = lireTout();
  delete toutes[clientId];
  ecrireTout(toutes);
}

export function preuveFournie(preuve: PreuveIntervention | null): boolean {
  return Boolean(preuve?.photo || preuve?.signature);
}

export function fichierVersDataUrl(fichier: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve(String(lecteur.result ?? ""));
    lecteur.onerror = () => reject(new Error("Lecture du fichier impossible."));
    lecteur.readAsDataURL(fichier);
  });
}

export async function dataUrlVersBlob(dataUrl: string): Promise<Blob> {
  const reponse = await fetch(dataUrl);
  return reponse.blob();
}

export async function compresserPhoto(fichier: File): Promise<File> {
  return imageCompression(fichier, {
    maxSizeMB: 0.7,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
}

export async function televerserPreuve(
  companyId: string | null,
  clientId: string,
  contenu: Blob,
  extension: "jpg" | "png",
): Promise<string | null> {
  if (!companyId) return null;

  try {
    const supabase = createClient();
    const chemin = `${companyId}/${clientId}/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.${extension}`;
    const { error } = await supabase.storage
      .from("client-proofs")
      .upload(chemin, contenu, {
        contentType: extension === "png" ? "image/png" : "image/jpeg",
        upsert: false,
      });

    if (error) return null;
    return chemin;
  } catch {
    return null;
  }
}

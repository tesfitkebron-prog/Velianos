import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { createClient } from "@/lib/supabase/server";
import {
  estFichierPdf,
  MESSAGE_EXTRACTION_PDF_IMPOSSIBLE,
  MESSAGE_FICHIER_NON_PDF,
  MESSAGE_FICHIER_TROP_LOURD,
  normaliserTexteExtrait,
  TAILLE_MAX_FICHIER,
} from "@/lib/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Texte maximal conservé dans `companies.knowledge_base`. */
const TAILLE_MAX_KNOWLEDGE_BASE = 120_000;

type DocumentRow = {
  title: string | null;
  content: string | null;
};

function construireBaseConnaissance(documents: DocumentRow[]): string {
  return documents
    .map((document, index) => {
      const titre = (document.title ?? "Document").trim() || "Document";
      return `### Document ${index + 1} : ${titre}\n${document.content ?? ""}`;
    })
    .join("\n\n")
    .trim()
    .slice(0, TAILLE_MAX_KNOWLEDGE_BASE);
}

function nomFichierSur(valeur: string): string {
  const propre = valeur
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(-120);

  return propre || "document.pdf";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Votre session a expiré." },
        { status: 401 },
      );
    }

    const { data: profil, error: profilError } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profilError) throw profilError;

    const companyId = (profil?.company_id as string | undefined) ?? "";
    if (!companyId) {
      return NextResponse.json(
        { error: "Aucune entreprise associée à ce compte." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const fichier = formData.get("file");
    const companyDemande = formData.get("companyId");

    if (
      typeof companyDemande === "string" &&
      companyDemande.length > 0 &&
      companyDemande !== companyId
    ) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    if (!(fichier instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier PDF reçu." },
        { status: 400 },
      );
    }

    if (!estFichierPdf(fichier)) {
      return NextResponse.json(
        { error: MESSAGE_FICHIER_NON_PDF },
        { status: 415 },
      );
    }

    if (fichier.size > TAILLE_MAX_FICHIER) {
      return NextResponse.json(
        { error: MESSAGE_FICHIER_TROP_LOURD },
        { status: 413 },
      );
    }

    const octets = new Uint8Array(await fichier.arrayBuffer());
    if (octets.byteLength === 0) {
      return NextResponse.json(
        { error: "Le fichier PDF est vide." },
        { status: 400 },
      );
    }

    let texte = "";
    let pdf: Awaited<ReturnType<typeof getDocumentProxy>> | null = null;

    try {
      pdf = await getDocumentProxy(octets.slice());
      const resultat = await extractText(pdf, { mergePages: true });
      texte = normaliserTexteExtrait(
        Array.isArray(resultat.text)
          ? resultat.text.join("\n\n")
          : resultat.text,
      );
    } catch (erreur) {
      console.error("Extraction du PDF impossible.", erreur);
      return NextResponse.json(
        { error: MESSAGE_EXTRACTION_PDF_IMPOSSIBLE },
        { status: 422 },
      );
    } finally {
      await pdf?.destroy().catch(() => {});
    }

    if (!texte) {
      return NextResponse.json(
        { error: MESSAGE_EXTRACTION_PDF_IMPOSSIBLE },
        { status: 422 },
      );
    }

    const chemin = `${companyId}/${Date.now()}-${nomFichierSur(
      fichier.name,
    )}`;

    const { error: uploadError } = await supabase.storage
      .from("company-documents")
      .upload(chemin, octets, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      if (/bucket|not found/i.test(uploadError.message)) {
        return NextResponse.json(
          {
            error:
              "Le stockage des documents n'est pas encore activé. Contactez le support.",
          },
          { status: 503 },
        );
      }
      throw uploadError;
    }

    const { data: document, error: baseError } = await supabase
      .from("company_knowledge")
      .insert({
        company_id: companyId,
        type: "pdf",
        title: fichier.name.slice(0, 200),
        content: texte,
        file_url: chemin,
        processed: true,
      })
      .select("id")
      .single();

    if (baseError) {
      await supabase.storage.from("company-documents").remove([chemin]);
      throw baseError;
    }

    const { data: documents, error: documentsError } = await supabase
      .from("company_knowledge")
      .select("title, content")
      .eq("company_id", companyId)
      .eq("type", "pdf")
      .not("content", "is", null)
      .order("created_at", { ascending: false });

    if (documentsError) {
      await supabase
        .from("company_knowledge")
        .delete()
        .eq("id", document.id);
      await supabase.storage.from("company-documents").remove([chemin]);
      throw documentsError;
    }

    const knowledgeBase = construireBaseConnaissance(
      (documents ?? []) as DocumentRow[],
    );

    const { error: updateError } = await supabase
      .from("companies")
      .update({ knowledge_base: knowledgeBase })
      .eq("id", companyId);

    if (updateError) {
      await supabase
        .from("company_knowledge")
        .delete()
        .eq("id", document.id);
      await supabase.storage.from("company-documents").remove([chemin]);
      throw updateError;
    }

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      titre: fichier.name,
      caracteres: texte.length,
      knowledgeBaseCaracteres: knowledgeBase.length,
    });
  } catch (erreur) {
    console.error("Traitement du document PDF impossible.", erreur);
    return NextResponse.json(
      { error: "Impossible d'enregistrer ce document pour le moment." },
      { status: 500 },
    );
  }
}

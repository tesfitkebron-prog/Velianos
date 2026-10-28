import "server-only";

/** Message au format attendu par l'API Chat Completions d'OpenAI. */
export type MessageOpenAi = {
  role: "system" | "user" | "assistant";
  content: string;
};

const MODELE_PAR_DEFAUT = "gpt-4o-mini";
const LONGUEUR_MAX_REPONSE = 1_500;

let avertissementCleAffiche = false;

export function openAiConfigure(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * Envoie une conversation à OpenAI et renvoie la réponse texte.
 *
 * Retourne `null` si la clé est absente, si l'API est indisponible ou si la
 * réponse est vide. L'appelant doit alors appliquer sa réponse de repli.
 */
export async function genererReponseSms(
  messages: MessageOpenAi[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<string | null> {
  const cle = process.env.OPENAI_API_KEY?.trim();
  if (!cle) {
    if (!avertissementCleAffiche) {
      avertissementCleAffiche = true;
      console.warn(
        "OPENAI_API_KEY absente : l'assistant SMS utilisera la réponse de repli.",
      );
    }
    return null;
  }

  try {
    const reponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || MODELE_PAR_DEFAUT,
        messages,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 220,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!reponse.ok) {
      const detail = await reponse.text().catch(() => "");
      console.error(
        `OpenAI a répondu ${reponse.status} : ${detail.slice(0, 300)}`,
      );
      return null;
    }

    const data = (await reponse.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const texte = data.choices?.[0]?.message?.content ?? "";
    const propre = texte
      .replace(/^```[a-z]*\s*/i, "")
      .replace(/```$/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, LONGUEUR_MAX_REPONSE);

    return propre || null;
  } catch (erreur) {
    console.error("Appel OpenAI impossible.", erreur);
    return null;
  }
}

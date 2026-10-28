"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechResultLike = {
  0: { transcript: string };
};

type SpeechEventLike = {
  results: {
    [index: number]: SpeechResultLike;
  };
};

type SpeechErrorEventLike = {
  error?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechErrorEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function constructeurReconnaissance(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const navigateur = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return navigateur.SpeechRecognition ?? navigateur.webkitSpeechRecognition ?? null;
}

/**
 * Dictée vocale française basée sur l'API Web Speech.
 * Le micro s'arrête automatiquement à la fin de la phrase.
 */
export function useSpeechRecognition(
  onTranscript: (texte: string) => void,
) {
  const [ecoute, setEcoute] = useState(false);
  const [supporte, setSupporte] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const reconnaissance = useRef<SpeechRecognitionLike | null>(null);
  const retour = useRef(onTranscript);

  useEffect(() => {
    retour.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const Constructeur = constructeurReconnaissance();
    if (!Constructeur) {
      setSupporte(false);
      return;
    }

    setSupporte(true);
    const instance = new Constructeur();
    instance.lang = "fr-FR";
    instance.continuous = false;
    instance.interimResults = false;
    instance.maxAlternatives = 1;

    instance.onresult = (event) => {
      const texte = event.results[0]?.[0]?.transcript?.trim();
      if (texte) retour.current(texte);
    };
    instance.onend = () => setEcoute(false);
    instance.onerror = (event) => {
      setEcoute(false);
      setErreur(
        event.error === "not-allowed"
          ? "Autorisez le microphone dans les réglages du téléphone."
          : "La dictée s'est arrêtée. Réessayez.",
      );
    };

    reconnaissance.current = instance;

    return () => {
      instance.onresult = null;
      instance.onend = null;
      instance.onerror = null;
      try {
        instance.abort();
      } catch {
        // L'instance est déjà arrêtée.
      }
      reconnaissance.current = null;
    };
  }, []);

  const demarrer = useCallback(() => {
    const instance = reconnaissance.current;
    if (!instance) return;

    if (ecoute) {
      instance.stop();
      setEcoute(false);
      return;
    }

    setErreur(null);
    try {
      instance.start();
      setEcoute(true);
    } catch {
      setEcoute(false);
      setErreur("Impossible de démarrer la dictée. Réessayez.");
    }
  }, [ecoute]);

  return { ecoute, supporte, erreur, demarrer };
}

export default useSpeechRecognition;

"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileDown,
  Loader2,
  Map,
  MapPin,
  PauseCircle,
  PenTool,
  Phone,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/components/ui/ToastProvider";
import { ConfirmationSuppression } from "@/components/ui/ConfirmationSuppression";
import { IntentPreview } from "@/components/ui/IntentPreview";
import { MicButton } from "@/components/ui/MicButton";
import { SaveStatus, type EtatSauvegarde } from "@/components/ui/SaveStatus";
import { UndoToast } from "@/components/ui/UndoToast";
import { SignaturePad } from "@/components/clients/SignaturePad";
import { useRetourAndroid } from "@/components/layout/useRetourAndroid";
import { usePaywallGuard } from "@/components/layout/usePaywallGuard";
import { MESSAGE_ERREUR_MUTATION } from "@/lib/errors";
import {
  changerStatutRendezVous,
  chargerDonneesTerrain,
  enregistrerNoteClient,
  marquerRendezVousTraite,
  supprimerClient,
} from "@/lib/field-data";
import {
  STYLE_URGENCE,
  lienGoogleMaps,
  lienTelephone,
  vibrer,
  type ClientFiche,
} from "@/lib/clients";
import {
  ajouterAction,
  retirerAction,
} from "@/lib/offline-queue";
import {
  compresserPhoto,
  dataUrlVersBlob,
  enregistrerPreuve,
  fichierVersDataUrl,
  lirePreuve,
  preuveFournie,
  supprimerPreuve,
  televerserPreuve,
  type PreuveIntervention,
} from "@/lib/proof";
import { enregistrerAudit } from "@/lib/audit";
import { formatDateFrench } from "@/lib/date";
import {
  enregistrerNoteExemple,
  lireNoteExemple,
  trouverClientExemple,
} from "@/lib/examples";
import {
  MOTIFS_ATTENTE,
  WORK_ORDER_META,
  enregistrerEtatTravail,
  lireEtatTravail,
  prochainEtat,
  type WorkOrderState,
  type WorkOrderStatus,
} from "@/lib/work-orders";

type ReponseAssistant = {
  texte: string;
  confiance: number;
};

type AnnulationTraitement = {
  appointmentId: string;
  statutPrecedent: string;
  actionOffline?: string;
  etatPrecedent?: WorkOrderState | null;
  exemple?: boolean;
};

export default function ClientDetailPage() {
  const router = useRouter();
  const { showToast } = useToast();
  useRetourAndroid("/clients");
  usePaywallGuard();
  const params = useParams<{ id: string }>();
  const clientId =
    typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const estExemple = clientId.startsWith("exemple-");

  const [client, setClient] = useState<ClientFiche | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState<ReponseAssistant | null>(null);
  const [reflexion, setReflexion] = useState(false);
  const [note, setNote] = useState("");
  const [enregistrementNote, setEnregistrementNote] = useState(false);
  const [preuve, setPreuve] = useState<PreuveIntervention | null>(null);
  const [photoEnCours, setPhotoEnCours] = useState(false);
  const [signatureOuverte, setSignatureOuverte] = useState(false);
  const [traitementEnCours, setTraitementEnCours] = useState(false);
  const [traite, setTraite] = useState(false);
  const [annulation, setAnnulation] = useState<AnnulationTraitement | null>(
    null,
  );
  const [etatTravail, setEtatTravail] = useState<WorkOrderState | null>(null);
  const [motifsOuverts, setMotifsOuverts] = useState(false);
  const [sauvegarde, setSauvegarde] = useState<EtatSauvegarde>("local");
  const [rdvPreview, setRdvPreview] = useState(false);
  const [rdvEnCours, setRdvEnCours] = useState(false);
  const [suppressionOuverte, setSuppressionOuverte] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(
    null,
  );
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    // Les fiches d'exemple sont locales : elles fonctionnent même hors-ligne.
    const exemple = trouverClientExemple(clientId);
    if (exemple) {
      setCompanyId(null);
      setClient(exemple);
      setNote(lireNoteExemple(clientId) ?? exemple.notes ?? "");
      setPreuve(lirePreuve(clientId));
      setTraite(exemple.statutRdv === "completed");
      setEtatTravail(lireEtatTravail(clientId, exemple.statutRdv));
      setSauvegarde("local");
      setChargement(false);
      return;
    }

    const terrain = await chargerDonneesTerrain();
    const trouve =
      [...terrain.prospects, ...terrain.clients].find(
        (item) => item.id === clientId,
      ) ?? null;

    setCompanyId(terrain.companyId);
    setClient(trouve);
    setNote(trouve?.notes ?? "");
    setPreuve(lirePreuve(clientId));
    setTraite(trouve?.statutRdv === "completed");
    setEtatTravail(
      trouve ? lireEtatTravail(clientId, trouve.statutRdv) : null,
    );
    setSauvegarde(
      typeof navigator !== "undefined" && navigator.onLine
        ? "accepted"
        : "local",
    );
    setErreur(terrain.erreur && !trouve ? terrain.erreur : null);
    setChargement(false);
  }, [clientId]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(
    () => () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    },
    [],
  );

  const retour = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/clients");
  };

  const demanderAssistant = (valeur: string) => {
    const propre = valeur.trim();
    if (!propre || !client || reflexion) return;

    vibrer(50);
    setQuestion("");
    setReflexion(true);

    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => {
      setReponse(reponseAssistant(client, propre));
      setReflexion(false);
    }, 500);
  };

  const envoyer = (event: FormEvent) => {
    event.preventDefault();
    demanderAssistant(question);
  };

  const exporter = () => {
    vibrer(30);
    showToast("📄 Génération du PDF en cours...", { variant: "info" });
    window.setTimeout(() => window.print(), 250);
  };

  const sauvegarderNote = async () => {
    if (!client) return;

    const propre = note.trim();
    if (!propre) {
      showToast("Ajoutez une note avant d'enregistrer.", {
        variant: "warning",
      });
      return;
    }

    vibrer(30);

    if (estExemple) {
      enregistrerNoteExemple(client.id, propre);
      setClient((precedent) =>
        precedent ? { ...precedent, notes: propre } : precedent,
      );
      setSauvegarde("local");
      showToast("✅ Note enregistrée sur l'appareil.", { variant: "success" });
      return;
    }

    if (!navigator.onLine) {
      const ancienneNote = client.notes ?? "";
      const action = ajouterAction({
        type: "client-note",
        clientId: client.id,
        note: propre,
      });

      setClient((precedent) =>
        precedent ? { ...precedent, notes: propre } : precedent,
      );
      setSauvegarde("pending");
      showToast(
        "📡 En attente de transfert. La note sera synchronisée au retour du réseau.",
        {
          variant: "warning",
          duration: 6000,
          actionLabel: "Annuler",
          onAction: () => {
            retirerAction(action.id);
            setClient((precedent) =>
              precedent ? { ...precedent, notes: ancienneNote } : precedent,
            );
            setNote(ancienneNote);
            setSauvegarde("local");
          },
        },
      );
      return;
    }

    setEnregistrementNote(true);

    try {
      const resultat = await enregistrerNoteClient(client.id, propre);

      if (resultat.erreur) {
        showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
        return;
      }

      setClient((precedent) =>
        precedent ? { ...precedent, notes: propre } : precedent,
      );
      setSauvegarde("accepted");
      showToast("✅ Note enregistrée.", { variant: "success" });
    } catch {
      showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
    } finally {
      setEnregistrementNote(false);
    }
  };

  const ajouterPhoto = async (
    evenement: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fichier = evenement.target.files?.[0];
    const clientCourant = client;
    evenement.target.value = "";
    if (!fichier || !clientCourant) return;

    vibrer(30);
    setPhotoEnCours(true);

    try {
      const compressee = await compresserPhoto(fichier);
      const photo = await fichierVersDataUrl(compressee);
      const chemin = estExemple
        ? null
        : await televerserPreuve(
            companyId,
            clientCourant.id,
            compressee,
            "jpg",
          );
      const nouvelle: PreuveIntervention = {
        ...(preuve ?? {}),
        photo,
        photoPath: chemin ?? preuve?.photoPath,
        updatedAt: new Date().toISOString(),
      };

      enregistrerPreuve(clientCourant.id, nouvelle);
      setPreuve(nouvelle);
      showToast("📸 Photo ajoutée à la preuve d'intervention.", {
        variant: "success",
      });
    } catch {
      showToast("La photo n'a pas pu être préparée. Réessayez.", {
        variant: "error",
      });
    } finally {
      setPhotoEnCours(false);
    }
  };

  const validerSignature = async (dataUrl: string) => {
    if (!client) return;

    setSignatureOuverte(false);
    vibrer(50);

    try {
      const blob = await dataUrlVersBlob(dataUrl);
      const chemin = estExemple
        ? null
        : await televerserPreuve(companyId, client.id, blob, "png");
      const nouvelle: PreuveIntervention = {
        ...(preuve ?? {}),
        signature: dataUrl,
        signaturePath: chemin ?? preuve?.signaturePath,
        updatedAt: new Date().toISOString(),
      };

      enregistrerPreuve(client.id, nouvelle);
      setPreuve(nouvelle);
      showToast("✍️ Signature du client enregistrée.", {
        variant: "success",
      });
    } catch {
      showToast("La signature n'a pas pu être enregistrée.", {
        variant: "error",
      });
    }
  };

  const retirerPreuvePhoto = () => {
    if (!client) return;
    const nouvelle: PreuveIntervention = {
      ...(preuve ?? {}),
      photo: undefined,
      photoPath: undefined,
      updatedAt: new Date().toISOString(),
    };
    enregistrerPreuve(client.id, nouvelle);
    setPreuve(nouvelle);
  };

  const retirerSignature = () => {
    if (!client) return;
    const nouvelle: PreuveIntervention = {
      ...(preuve ?? {}),
      signature: undefined,
      signaturePath: undefined,
      updatedAt: new Date().toISOString(),
    };
    enregistrerPreuve(client.id, nouvelle);
    setPreuve(nouvelle);
  };

  const marquerTraite = async () => {
    if (!client || !preuveFournie(preuve) || traitementEnCours || traite) {
      return;
    }
    if (!client.appointmentId) {
      showToast("Aucun rendez-vous ouvert à clôturer pour ce client.", {
        variant: "warning",
      });
      return;
    }

    vibrer(50);
    const appointmentId = client.appointmentId;
    const statutPrecedent =
      client.statutRdv && client.statutRdv !== "completed"
        ? client.statutRdv
        : "confirmed";
    const etatPrecedent = etatTravail;

    if (estExemple) {
      setTraite(true);
      setSauvegarde("local");
      setAnnulation({
        appointmentId,
        statutPrecedent,
        etatPrecedent,
        exemple: true,
      });
      setEtatTravail(
        enregistrerEtatTravail(client.id, {
          status: "submitted",
          nextOwner: "Vous",
          history: etatPrecedent?.history,
        }),
      );
      enregistrerAudit({
        titre: `Client traité : ${client.nom}`,
        rationale:
          "Exemple interactif : vous avez fourni une preuve et soumis le travail à validation.",
        autorite: "vous",
        reversible: true,
        rollback: {
          appointmentId,
          statutPrecedent,
          workOrderClientId: client.id,
          workOrderStatus: etatPrecedent?.status,
          workOrderHoldReason: etatPrecedent?.holdReason,
          workOrderNextOwner: etatPrecedent?.nextOwner,
        },
      });
      return;
    }

    if (!navigator.onLine) {
      const action = ajouterAction({
        type: "appointment-complete",
        appointmentId,
        clientId: client.id,
        statutPrecedent,
      });

      setTraite(true);
      setSauvegarde("pending");
      setAnnulation({
        appointmentId,
        statutPrecedent,
        actionOffline: action.id,
        etatPrecedent,
      });
      setEtatTravail(
        enregistrerEtatTravail(client.id, {
          status: "submitted",
          nextOwner: "Vous",
          history: etatPrecedent?.history,
        }),
      );
      enregistrerAudit({
        titre: `Client traité : ${client.nom}`,
        rationale:
          "Vous avez fourni une preuve d'intervention puis validé la clôture hors-ligne.",
        autorite: "vous",
        reversible: true,
        rollback: {
          appointmentId,
          statutPrecedent,
          workOrderClientId: client.id,
          workOrderStatus: etatPrecedent?.status,
          workOrderHoldReason: etatPrecedent?.holdReason,
          workOrderNextOwner: etatPrecedent?.nextOwner,
        },
      });
      return;
    }

    setTraitementEnCours(true);
    const resultat = await marquerRendezVousTraite(appointmentId);
    setTraitementEnCours(false);

    if (resultat.erreur) {
      showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
      return;
    }

    setTraite(true);
    setSauvegarde("accepted");
    setAnnulation({
      appointmentId,
      statutPrecedent,
      etatPrecedent,
    });
    setEtatTravail(
      enregistrerEtatTravail(client.id, {
        status: "submitted",
        nextOwner: "Vous",
        history: etatPrecedent?.history,
      }),
    );
    enregistrerAudit({
      titre: `Client traité : ${client.nom}`,
      rationale:
        "Vous avez fourni une preuve d'intervention et validé la clôture.",
      autorite: "vous",
      reversible: true,
      rollback: {
        appointmentId,
        statutPrecedent,
        workOrderClientId: client.id,
        workOrderStatus: etatPrecedent?.status,
        workOrderHoldReason: etatPrecedent?.holdReason,
        workOrderNextOwner: etatPrecedent?.nextOwner,
      },
    });
  };

  const annulerTraitement = async () => {
    if (!annulation || !client) return;

    if (annulation.exemple) {
      // Fiche d'exemple : aucune écriture distante.
    } else if (annulation.actionOffline) {
      retirerAction(annulation.actionOffline);
    } else {
      const resultat = await changerStatutRendezVous(
        annulation.appointmentId,
        annulation.statutPrecedent,
      );
      if (resultat.erreur) {
        showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
        return;
      }
    }

    setTraite(false);
    setSauvegarde("local");
    if (annulation.etatPrecedent) {
      setEtatTravail(
        enregistrerEtatTravail(client.id, {
          status: annulation.etatPrecedent.status,
          holdReason: annulation.etatPrecedent.holdReason,
          nextOwner: annulation.etatPrecedent.nextOwner,
          history: annulation.etatPrecedent.history,
        }),
      );
    }
    setAnnulation(null);
    showToast("Clôture annulée. Le client reste dans votre planning.", {
      variant: "info",
    });
  };

  const changerEtatTravail = (
    status: WorkOrderStatus,
    options?: { holdReason?: string; nextOwner?: string },
  ) => {
    if (!client) return;

    vibrer(50);
    const precedent = etatTravail;
    const suivant = enregistrerEtatTravail(client.id, {
      status,
      holdReason: options?.holdReason,
      nextOwner: options?.nextOwner ?? (status === "closed" ? "—" : "Vous"),
      history: precedent?.history,
    });

    setEtatTravail(suivant);
    setMotifsOuverts(false);

    enregistrerAudit({
      titre: `Travail « ${WORK_ORDER_META[status].label} » : ${client.nom}`,
      rationale: options?.holdReason
        ? `Motif : ${options.holdReason}. Prochain responsable : ${
            options.nextOwner ?? "Vous"
          }.`
        : "Vous avez fait avancer le travail depuis la fiche client.",
      autorite: "vous",
      reversible: true,
      rollback: precedent
        ? {
            workOrderClientId: client.id,
            workOrderStatus: precedent.status,
            workOrderHoldReason: precedent.holdReason,
            workOrderNextOwner: precedent.nextOwner,
          }
        : undefined,
    });

    showToast(`✅ Travail : ${WORK_ORDER_META[status].label}.`, {
      variant: "success",
      duration: 6000,
      actionLabel: "Annuler",
      onAction: () => {
        if (!precedent) return;
        setEtatTravail(
          enregistrerEtatTravail(client.id, {
            status: precedent.status,
            holdReason: precedent.holdReason,
            nextOwner: precedent.nextOwner,
            history: precedent.history,
          }),
        );
        showToast("État précédent restauré.", { variant: "info" });
      },
    });
  };

  const annulerConfirmationRdv = async (
    statutPrecedent: string,
    etatPrecedent: WorkOrderState | null,
  ) => {
    if (!client) return;

    if (!estExemple && client.appointmentId) {
      if (navigator.onLine) {
        await changerStatutRendezVous(client.appointmentId, statutPrecedent);
      } else {
        ajouterAction({
          type: "appointment-status",
          appointmentId: client.appointmentId,
          clientId: client.id,
          statut: statutPrecedent,
        });
      }
    }

    setClient((precedent) =>
      precedent ? { ...precedent, statutRdv: statutPrecedent } : precedent,
    );
    if (etatPrecedent) {
      setEtatTravail(
        enregistrerEtatTravail(client.id, {
          status: etatPrecedent.status,
          holdReason: etatPrecedent.holdReason,
          nextOwner: etatPrecedent.nextOwner,
          history: etatPrecedent.history,
        }),
      );
    }
    showToast("Confirmation annulée.", { variant: "info" });
  };

  const confirmerRdv = async () => {
    if (!client || rdvEnCours) return;

    setRdvEnCours(true);
    vibrer(50);

    const statutPrecedent = client.statutRdv ?? "pending";
    const etatPrecedent = etatTravail;

    if (!estExemple && client.appointmentId) {
      if (!navigator.onLine) {
        ajouterAction({
          type: "appointment-status",
          appointmentId: client.appointmentId,
          clientId: client.id,
          statut: "confirmed",
          statutPrecedent,
        });
        setSauvegarde("pending");
      } else {
        const resultat = await changerStatutRendezVous(
          client.appointmentId,
          "confirmed",
        );
        if (resultat.erreur) {
          showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
          setRdvEnCours(false);
          return;
        }
        setSauvegarde("accepted");
      }
    } else {
      setSauvegarde("local");
    }

    setClient((precedent) =>
      precedent ? { ...precedent, statutRdv: "confirmed" } : precedent,
    );
    setEtatTravail(
      enregistrerEtatTravail(client.id, {
        status: "assigned",
        nextOwner: "Vous",
        history: etatPrecedent?.history,
      }),
    );
    enregistrerAudit({
      titre: `Rendez-vous confirmé : ${client.nom}`,
      rationale:
        "Vous avez vérifié le texte, le numéro et le créneau avant confirmation.",
      autorite: "vous",
      reversible: true,
      rollback: {
        appointmentId: client.appointmentId ?? undefined,
        statutPrecedent,
        workOrderClientId: client.id,
        workOrderStatus: etatPrecedent?.status,
        workOrderHoldReason: etatPrecedent?.holdReason,
        workOrderNextOwner: etatPrecedent?.nextOwner,
      },
    });

    setRdvPreview(false);
    setRdvEnCours(false);

    showToast("✅ Rendez-vous confirmé.", {
      variant: "success",
      duration: 6000,
      actionLabel: "Annuler",
      onAction: () => void annulerConfirmationRdv(statutPrecedent, etatPrecedent),
    });
  };

  const confirmerSuppression = async () => {
    if (!client || suppressionEnCours) return;

    vibrer(50);
    setSuppressionEnCours(true);
    setErreurSuppression(null);

    const resultat = await supprimerClient(client.id);
    setSuppressionEnCours(false);

    if (resultat.erreur) {
      setErreurSuppression(resultat.erreur);
      return;
    }

    supprimerPreuve(client.id);
    enregistrerAudit({
      titre: `Client supprimé : ${client.nom}`,
      rationale: "Vous avez confirmé la suppression définitive de la fiche.",
      autorite: "vous",
      reversible: false,
    });
    showToast("🗑️ Client supprimé définitivement.", { variant: "success" });
    router.replace("/clients");
  };

  const badge = client
    ? client.urgence === "urgent"
      ? {
          label: "Urgent",
          className: STYLE_URGENCE.urgent.badge,
          Icon: TriangleAlert,
        }
      : client.urgence === "a_verifier"
        ? {
            label: "À vérifier",
            className: STYLE_URGENCE.a_verifier.badge,
            Icon: Eye,
          }
        : client.badge
          ? {
              label: client.badge,
              className: STYLE_URGENCE.normal.badge,
              Icon: Check,
            }
          : null
    : null;

  const accentProbleme =
    client?.urgence === "urgent"
      ? "text-red-600"
      : client?.urgence === "a_verifier"
        ? "text-orange-600"
        : "text-[#1D4ED8]";
  const accentBar =
    client?.urgence === "urgent"
      ? "bg-red-500"
      : client?.urgence === "a_verifier"
        ? "bg-orange-500"
        : "bg-[#2F6BFF]";
  const accentSoft =
    client?.urgence === "urgent"
      ? "bg-red-50 text-red-600"
      : client?.urgence === "a_verifier"
        ? "bg-orange-50 text-orange-600"
        : "bg-[#EDF3FF] text-[#1D4ED8]";

  const tel = client ? lienTelephone(client.telephone) : null;
  const maps = client ? lienGoogleMaps(client.adresse) : null;
  const tags = client ? tagsClient(client) : [];
  const etatMeta = etatTravail ? WORK_ORDER_META[etatTravail.status] : null;
  const suivantTravail = etatTravail
    ? prochainEtat(etatTravail.status)
    : null;
  const suggestion = etatTravail
    ? suggestionTravail(etatTravail.status)
    : null;
  const historiqueTravail = etatTravail?.history ?? [];
  const dateRdvTexte = client?.dateRdv
    ? formatDateFrench(client.dateRdv, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";
  const heureRdvTexte =
    client?.heureRdv ||
    (client?.dateRdv
      ? formatDateFrench(client.dateRdv, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "");
  const rdvConfirme = client?.statutRdv === "confirmed";
  const rdvMessage = client
    ? `Bonjour ${client.nom}, je vous confirme notre rendez-vous${
        dateRdvTexte ? ` le ${dateRdvTexte}` : ""
      }${heureRdvTexte ? ` à ${heureRdvTexte}` : ""}. À bientôt.`
    : "";

  return (
    <div className="fiche-client-shell app-surface flex h-[100dvh] flex-col">
      <header className="print-hidden sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-1 px-2">
          <button
            type="button"
            onClick={retour}
            aria-label="Retour"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-700 transition-transform duration-200 active:scale-95 active:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <div className="min-w-0 flex-1 px-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Fiche client
            </p>
            <h1 className="truncate text-base font-extrabold leading-tight tracking-tight text-slate-900">
              {client?.nom ?? "Chargement…"}
            </h1>
          </div>
          <button
            type="button"
            onClick={exporter}
            disabled={!client}
            aria-label="Exporter la fiche en PDF"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-transform duration-200 active:scale-95 active:bg-slate-100 disabled:opacity-40"
          >
            <FileDown className="h-5 w-5" aria-hidden="true" />
          </button>
          {estExemple ? (
            <span className="flex h-8 flex-shrink-0 items-center rounded-full bg-amber-100 px-2.5 text-[11px] font-extrabold uppercase tracking-wide text-amber-900">
              Exemple
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!client) return;
                vibrer(40);
                setErreurSuppression(null);
                setSuppressionOuverte(true);
              }}
              disabled={!client}
              aria-label="Supprimer ce client"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-red-600 transition-transform duration-200 active:scale-95 active:bg-red-50 disabled:opacity-40"
            >
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <main className="fiche-client-main w-full flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-3 md:px-6">
          {chargement ? (
            <PageSkeleton lignes={4} />
          ) : erreur ? (
            <PageError message={erreur} onRetry={() => void charger()} />
          ) : !client ? (
            <EmptyState
              icon={Users}
              title="Client introuvable"
              description="Cette fiche n'existe plus ou n'est pas disponible dans votre espace."
              actionLabel="Retour aux clients"
              onAction={() => router.push("/clients")}
            />
          ) : (
            <div className="fiche-client-content space-y-4">
              <div className="print-only">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Fiche client
                </p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                  {client.nom}
                </p>
              </div>

              <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,#ffffff_0%,#f8faff_58%,#eaf1ff_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.09)]">
                <span
                  className={`absolute inset-x-0 top-0 h-1.5 ${accentBar}`}
                  aria-hidden="true"
                />

                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold ${accentSoft}`}
                  >
                    {client.initiales || "C"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {badge && (
                        <span
                          className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}
                        >
                          <badge.Icon
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          {badge.label}
                        </span>
                      )}
                      {etatMeta && (
                        <span
                          className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${etatMeta.badge}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${etatMeta.pastille}`}
                            aria-hidden="true"
                          />
                          {etatMeta.label}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 break-words text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
                      {client.nom}
                    </h2>
                  </div>
                </div>

                <p
                  className={`mt-3 break-words text-[25px] font-extrabold leading-[1.15] tracking-tight ${accentProbleme}`}
                >
                  {client.probleme}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/85 px-3.5 py-2.5 ring-1 ring-slate-200/80">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Téléphone
                      </span>
                      <span className="block truncate text-base font-extrabold text-slate-900">
                        {client.telephone ||
                          client.telephoneAffiche ||
                          "Non renseigné"}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white/85 px-3.5 py-2.5 ring-1 ring-slate-200/80">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#EDF3FF] text-[#2F6BFF]">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Adresse
                      </span>
                      <span className="block text-sm font-bold leading-snug text-slate-900">
                        {client.adresse || "Adresse non renseignée"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {tel ? (
                    <a
                      href={tel}
                      onClick={() => vibrer(50)}
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] text-base font-extrabold text-white shadow-lg shadow-[#2F6BFF]/25 transition-transform duration-200 active:scale-95"
                    >
                      <Phone className="h-5 w-5" aria-hidden="true" />
                      Appeler
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-200 text-sm font-bold text-slate-500"
                    >
                      <Phone className="h-5 w-5" aria-hidden="true" />
                      Numéro manquant
                    </button>
                  )}

                  {maps ? (
                    <a
                      href={maps}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => vibrer(40)}
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-base font-extrabold text-slate-800 shadow-sm transition-transform duration-200 active:scale-95"
                    >
                      <Map className="h-5 w-5" aria-hidden="true" />
                      Itinéraire
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-200 text-sm font-bold text-slate-500"
                    >
                      <Map className="h-5 w-5" aria-hidden="true" />
                      Adresse absente
                    </button>
                  )}
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Clock
                    className="h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  Dernier contact {client.moment}
                  {client.heure ? ` · ${client.heure}` : ""}
                </p>
              </section>

              {estExemple && (
                <div
                  role="note"
                  className="flex items-start gap-3 rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-amber-950"
                >
                  <Sparkles
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-bold leading-snug">
                    Fiche d&apos;exemple : les données sont fictives. Vous
                    pouvez essayer les boutons, changer l&apos;état du travail
                    et enregistrer une note.
                  </p>
                </div>
              )}

              {etatTravail && etatMeta && (
                <section className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
                      <ShieldCheck
                        className="h-6 w-6 text-[#2F6BFF]"
                        aria-hidden="true"
                      />
                      État du travail
                    </h3>
                    <span
                      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-extrabold ${etatMeta.badge}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${etatMeta.pastille}`}
                        aria-hidden="true"
                      />
                      {etatMeta.label}
                    </span>
                  </div>

                  <p className="mt-2 text-lg font-medium leading-relaxed text-slate-700">
                    {etatMeta.description}
                  </p>

                  {etatTravail.status === "on_hold" && (
                    <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                      <p className="text-base font-extrabold leading-snug text-orange-950">
                        Motif : {etatTravail.holdReason ?? "Non précisé"}
                      </p>
                      <p className="mt-1 text-base font-semibold leading-snug text-orange-900">
                        Prochain responsable :{" "}
                        {etatTravail.nextOwner ?? "Vous"}
                      </p>
                    </div>
                  )}

                  {motifsOuverts ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-base font-extrabold text-slate-900">
                        Pourquoi mettre ce travail en attente ?
                      </p>
                      {MOTIFS_ATTENTE.map((motif) => (
                        <button
                          key={motif.value}
                          type="button"
                          onClick={() =>
                            changerEtatTravail("on_hold", {
                              holdReason: motif.label,
                              nextOwner: motif.nextOwner,
                            })
                          }
                          className="flex min-h-16 w-full flex-col items-start justify-center rounded-2xl bg-orange-50 px-4 py-3 text-left transition-transform duration-200 active:scale-95"
                        >
                          <span className="text-base font-extrabold text-orange-950">
                            {motif.label}
                          </span>
                          <span className="text-sm font-semibold text-orange-800">
                            Prochain responsable : {motif.nextOwner}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setMotifsOuverts(false)}
                        className="min-h-16 w-full rounded-2xl text-base font-extrabold text-slate-600 transition-transform duration-200 active:scale-95"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {suggestion && (
                        <div className="rounded-2xl bg-blue-50 p-4">
                          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-blue-800">
                            <Sparkles
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            L&apos;assistant suggère
                          </p>
                          <p className="mt-1 text-base font-medium leading-snug text-blue-950">
                            {suggestion.raison}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              changerEtatTravail(suggestion.status)
                            }
                            className="mt-3 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-extrabold text-blue-800 shadow-sm transition-transform duration-200 active:scale-95"
                          >
                            <Bot className="h-5 w-5" aria-hidden="true" />
                            Appliquer :{" "}
                            {WORK_ORDER_META[suggestion.status].label}
                          </button>
                        </div>
                      )}

                      {suivantTravail && (
                        <button
                          type="button"
                          onClick={() => changerEtatTravail(suivantTravail)}
                          className="flex min-h-20 w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] text-lg font-extrabold text-white shadow-lg shadow-[#2F6BFF]/25 transition-transform duration-200 active:scale-95"
                        >
                          <CheckCircle2
                            className="h-6 w-6"
                            aria-hidden="true"
                          />
                          Passer à «{" "}
                          {WORK_ORDER_META[suivantTravail].label} »
                        </button>
                      )}

                      {etatTravail.status !== "on_hold" &&
                        etatTravail.status !== "closed" && (
                          <button
                            type="button"
                            onClick={() => {
                              vibrer(40);
                              setMotifsOuverts(true);
                            }}
                            className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-slate-800 transition-transform duration-200 active:scale-95"
                          >
                            <PauseCircle
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                            Mettre en attente
                          </button>
                        )}

                      {etatTravail.status === "closed" && (
                        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-base font-semibold text-slate-600">
                          Ce travail est terminé et archivé.
                        </p>
                      )}
                    </div>
                  )}

                  {historiqueTravail.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-sm font-extrabold uppercase tracking-wide text-slate-500">
                        Historique du travail
                      </p>
                      <ol className="mt-2 space-y-2">
                        {historiqueTravail
                          .slice(-3)
                          .reverse()
                          .map((evenement) => (
                            <li
                              key={evenement.id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                            >
                              <span className="text-base font-bold text-slate-800">
                                {evenement.label}
                              </span>
                              <span className="flex-shrink-0 text-sm font-medium text-slate-500">
                                {formatDateFrench(evenement.at, {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </li>
                          ))}
                      </ol>
                    </div>
                  )}
                </section>
              )}

              <section
                id="fiche-client-infos"
                className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)]"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#EDF3FF] text-[#2F6BFF]">
                    <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Détails de la demande
                  </h3>
                </div>
                {client.resume ? (
                  <p className="mt-3 text-base font-medium leading-relaxed text-slate-700">
                    {client.resume}
                  </p>
                ) : (
                  <p className="mt-3 text-base font-semibold leading-relaxed text-slate-700">
                    {client.probleme}
                  </p>
                )}
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Rendez-vous
                  </h3>
                </div>

                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  <p className="text-base font-semibold text-slate-500">
                    Créneau prévu
                  </p>
                  <p className="mt-1 text-xl font-extrabold capitalize leading-snug text-slate-900">
                    {dateRdvTexte || "Aucune date"}
                  </p>
                  {heureRdvTexte && (
                    <p className="mt-0.5 text-lg font-bold text-slate-700">
                      {heureRdvTexte}
                    </p>
                  )}
                </div>

                {client.dateRdv || client.heureRdv ? (
                  <button
                    type="button"
                    onClick={() => {
                      vibrer(40);
                      setRdvPreview(true);
                    }}
                    className="mt-3 flex min-h-20 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-lg font-extrabold text-white shadow-lg shadow-blue-600/30 transition-transform duration-200 active:scale-95"
                  >
                    <CalendarDays className="h-6 w-6" aria-hidden="true" />
                    {rdvConfirme
                      ? "Renvoyer la confirmation"
                      : "Confirmer le rendez-vous"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-3 flex min-h-20 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-200 text-base font-bold text-slate-500"
                  >
                    <CalendarDays className="h-6 w-6" aria-hidden="true" />
                    Aucun créneau à confirmer
                  </button>
                )}

                <p className="mt-2 text-center text-base font-medium leading-snug text-slate-500">
                  Le client recevra un SMS avec la date et l&apos;heure exactes.
                </p>
              </section>

              <section className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Preuve d&apos;intervention
                  </h3>
                </div>
                <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                  Ajoutez une photo ou faites signer le client. La preuve est
                  obligatoire pour clôturer l&apos;intervention.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <label
                    htmlFor="preuve-photo"
                    className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 text-center text-base font-extrabold text-[#2F6BFF] transition-transform duration-200 active:scale-95"
                  >
                    {photoEnCours ? (
                      <Loader2
                        className="h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Camera className="h-5 w-5" aria-hidden="true" />
                    )}
                    {photoEnCours ? "Préparation…" : "Prendre une photo"}
                    <input
                      id="preuve-photo"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(evenement) => void ajouterPhoto(evenement)}
                      disabled={photoEnCours}
                      className="sr-only"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      vibrer(40);
                      setSignatureOuverte(true);
                    }}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 text-center text-base font-extrabold text-[#2F6BFF] transition-transform duration-200 active:scale-95"
                  >
                    <PenTool className="h-5 w-5" aria-hidden="true" />
                    Faire signer le client
                  </button>
                </div>

                {(preuve?.photo || preuve?.signature) && (
                  <div className="mt-3 space-y-2.5">
                    {preuve?.photo && (
                      <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preuve.photo}
                          alt="Photo de l'intervention"
                          className="h-40 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={retirerPreuvePhoto}
                          aria-label="Supprimer la photo"
                          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition-transform duration-200 active:scale-95"
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    )}

                    {preuve?.signature && (
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preuve.signature}
                          alt="Signature du client"
                          className="h-32 w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={retirerSignature}
                          aria-label="Supprimer la signature"
                          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition-transform duration-200 active:scale-95"
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {signatureOuverte && (
                  <SignaturePad
                    onValider={(dataUrl) => void validerSignature(dataUrl)}
                    onAnnuler={() => setSignatureOuverte(false)}
                  />
                )}

                <button
                  type="button"
                  onClick={() => void marquerTraite()}
                  disabled={
                    !preuveFournie(preuve) || traitementEnCours || traite
                  }
                  className="mt-4 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {traitementEnCours ? (
                    <Loader2
                      className="h-6 w-6 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  )}
                  {traite
                    ? "Client traité"
                    : traitementEnCours
                      ? "Clôture…"
                      : "Marquer comme traité"}
                </button>
                {!preuveFournie(preuve) && (
                  <p className="mt-2 text-center text-base font-medium text-slate-400">
                    Ajoutez une photo ou une signature pour activer la
                    clôture.
                  </p>
                )}
              </section>

              <section className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  Ce que l&apos;assistant a déjà dit au client
                </h3>

                <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                  {client.resume ||
                    "L'assistant n'a pas encore laissé de résumé pour ce client."}
                </p>

                {client.echanges.length > 0 ? (
                  <div className="mt-3 space-y-2.5">
                    {client.echanges.map((echange, index) => (
                      <p
                        key={`${client.id}-echange-${index}`}
                        className="w-fit max-w-[92%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-base font-medium leading-snug text-slate-700"
                      >
                        {echange}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-base font-medium leading-relaxed text-slate-500">
                    L&apos;assistant n&apos;a pas encore échangé avec ce client.
                  </p>
                )}

                <div className="mt-4 border-t border-slate-100 pt-4 print-hidden">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="h-4 w-4 text-[#2F6BFF]"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Demander à l&apos;assistant
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      demanderAssistant(
                        "Résume-moi la conversation avec ce client",
                      )
                    }
                    disabled={reflexion}
                    className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-[#2F6BFF] transition-transform duration-200 active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                    Générer un résumé
                  </button>

                  {reflexion && (
                    <div className="mt-3 flex items-center gap-2 rounded-[20px] rounded-tl-md bg-slate-50 px-4 py-3">
                      <Loader2
                        className="h-4 w-4 animate-spin text-slate-400"
                        aria-hidden="true"
                      />
                      <span className="text-base font-medium text-slate-500">
                        L&apos;assistant réfléchit…
                      </span>
                    </div>
                  )}

                  {reponse && !reflexion && (
                    reponse.confiance < 90 ? (
                      <div className="mt-3 rounded-[20px] rounded-tl-md bg-orange-50 px-4 py-3">
                        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-orange-600">
                          <TriangleAlert
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Vérification nécessaire
                        </p>
                        <p className="mt-1 text-base font-semibold leading-relaxed text-slate-700">
                          Je ne suis pas sûr de la réponse. Pouvez-vous vérifier
                          l&apos;information ?
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            vibrer(30);
                            document
                              .getElementById("fiche-client-infos")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                          }}
                          className="mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-extrabold text-[#2F6BFF] shadow-sm transition-transform duration-200 active:scale-95"
                        >
                          <Eye className="h-5 w-5" aria-hidden="true" />
                          Vérifier
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[20px] rounded-tl-md bg-slate-50 px-4 py-3">
                        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                          Assistant
                        </p>
                        <p className="mt-1 text-base font-medium leading-relaxed text-slate-700">
                          {reponse.texte}
                        </p>
                      </div>
                    )
                  )}

                  <form onSubmit={envoyer} className="mt-3 flex items-end gap-2">
                    <label htmlFor="client-question" className="sr-only">
                      Posez votre question à l&apos;assistant
                    </label>
                    <input
                      id="client-question"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder="Posez votre question…"
                      className="h-14 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#2F6BFF]/45 focus:outline-none focus:ring-4 focus:ring-[#2F6BFF]/10"
                    />
                    <MicButton
                      onTranscript={(texte) =>
                        setQuestion((precedent) =>
                          precedent.trim()
                            ? `${precedent.trim()} ${texte}`
                            : texte,
                        )
                      }
                      onIndisponible={() =>
                        showToast(
                          "La dictée vocale n'est pas disponible sur ce navigateur.",
                          { variant: "warning" },
                        )
                      }
                    />
                    <button
                      type="submit"
                      disabled={reflexion || question.trim().length === 0}
                      aria-label="Envoyer la question"
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-white shadow-lg shadow-[#2F6BFF]/30 transition-transform duration-200 active:scale-95 disabled:opacity-40"
                    >
                      <ArrowUp className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  <StickyNote className="h-4 w-4" aria-hidden="true" />
                  Vos notes
                </h3>
                <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                  Ajoutez vos propres informations sur ce client. Elles restent
                  visibles dans sa fiche.
                </p>

                <label htmlFor="client-note" className="sr-only">
                  Vos notes sur ce client
                </label>
                <textarea
                  id="client-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={5}
                  placeholder="Ex : Le client préfère être rappelé après 18h."
                  className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium leading-relaxed text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#2F6BFF]/45 focus:outline-none focus:ring-4 focus:ring-[#2F6BFF]/10"
                />
                <button
                  type="button"
                  onClick={() => void sauvegarderNote()}
                  disabled={enregistrementNote || note.trim().length === 0}
                  className="mt-2 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] text-lg font-extrabold text-white transition-transform duration-200 active:scale-95 disabled:opacity-40"
                >
                  {enregistrementNote ? (
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  )}
                  {enregistrementNote ? "Enregistrement…" : "Enregistrer la note"}
                </button>
                <SaveStatus etat={sauvegarde} className="mt-3" />
              </section>
            </div>
          )}
        </div>
      </main>

      {client && (
        <div className="print-hidden w-full flex-shrink-0 border-t border-slate-200/60 bg-white/90 px-4 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl">
          <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-2">
            {tel ? (
              <a
                href={tel}
                onClick={() => vibrer(50)}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] text-base font-extrabold text-white shadow-lg shadow-[#2F6BFF]/25 transition-transform duration-200 active:scale-95"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                Appeler
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-14 cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-200 text-sm font-bold text-slate-500"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                Numéro manquant
              </button>
            )}

            {maps ? (
              <a
                href={maps}
                target="_blank"
                rel="noreferrer"
                onClick={() => vibrer(40)}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-base font-extrabold text-slate-800 shadow-sm transition-transform duration-200 active:scale-95"
              >
                <Map className="h-5 w-5" aria-hidden="true" />
                Itinéraire
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-14 cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-200 text-sm font-bold text-slate-500"
              >
                <Map className="h-5 w-5" aria-hidden="true" />
                Adresse absente
              </button>
            )}
          </div>
        </div>
      )}

      <IntentPreview
        open={rdvPreview}
        titre="Confirmer ce rendez-vous ?"
        description="Vérifiez le texte, le numéro et le créneau avant l'envoi."
        telephone={client?.telephone ?? ""}
        details={[
          { label: "Client", value: client?.nom ?? "" },
          { label: "Date", value: dateRdvTexte || "Non précisée" },
          { label: "Heure", value: heureRdvTexte || "Non précisée" },
        ]}
        message={rdvMessage}
        confirmerLabel="Confirmer le rendez-vous"
        onConfirm={() => void confirmerRdv()}
        onModify={() => {
          setRdvPreview(false);
          document
            .getElementById("fiche-client-infos")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        onCancel={() => setRdvPreview(false)}
        enCours={rdvEnCours}
      />

      <UndoToast
        isVisible={annulation !== null}
        message="Client traité."
        onUndo={() => void annulerTraitement()}
        onClose={() => setAnnulation(null)}
      />

      <ConfirmationSuppression
        open={suppressionOuverte}
        title="Supprimer ce client ?"
        description={`La fiche de ${client?.nom ?? "ce client"}, ses rendez-vous et son historique seront supprimés définitivement.`}
        actionLabel="Supprimer définitivement"
        onClose={() => {
          if (!suppressionEnCours) {
            setSuppressionOuverte(false);
            setErreurSuppression(null);
          }
        }}
        onConfirm={() => void confirmerSuppression()}
        enCours={suppressionEnCours}
        erreur={erreurSuppression}
      />
    </div>
  );
}

function suggestionTravail(status: WorkOrderStatus): {
  status: WorkOrderStatus;
  raison: string;
} | null {
  switch (status) {
    case "request":
      return {
        status: "assigned",
        raison:
          "Le rendez-vous est qualifié. Confirmez-le pour prévenir le client.",
      };
    case "assigned":
      return {
        status: "in_progress",
        raison:
          "Le jour du rendez-vous, passez le travail à « En cours » pour suivre l'intervention.",
      };
    case "in_progress":
      return {
        status: "submitted",
        raison:
          "L'intervention semble terminée. Soumettez-la pour validation avant de clôturer.",
      };
    case "on_hold":
      return {
        status: "in_progress",
        raison:
          "Le blocage est levé ? Reprenez le travail et poursuivez l'intervention.",
      };
    case "submitted":
      return {
        status: "closed",
        raison:
          "Tout est validé. Vous pouvez clôturer le travail et archiver la fiche.",
      };
    case "closed":
      return null;
  }
}

function tagsClient(client: ClientFiche): string[] {
  const texte = `${client.probleme} ${client.resume}`.toLowerCase();
  const tags: string[] = [];

  if (client.urgence === "urgent") tags.push("Urgent");
  if (client.urgence === "a_verifier") tags.push("À vérifier");
  if (/fuite|tuyau|évier|evier|plomb/.test(texte)) tags.push("Plomberie");
  if (/fuite/.test(texte)) tags.push("Fuite");
  if (/chauffage|chauffe|radiateur|chaudière|chaudiere/.test(texte)) {
    tags.push("Chauffage");
  }
  if (/électri|electri|prise|tableau/.test(texte)) tags.push("Électricité");
  if (/serrure|porte|clé|cle/.test(texte)) tags.push("Serrurerie");
  if (/devis|prix|tarif/.test(texte)) tags.push("Devis");

  return Array.from(new Set(tags)).slice(0, 4);
}

function reponseAssistant(
  client: ClientFiche,
  question: string,
): ReponseAssistant {
  const texte = question.toLowerCase();

  if (
    texte.includes("résum") ||
    texte.includes("resum") ||
    texte.includes("conversation")
  ) {
    const notes =
      client.echanges.length > 0
        ? `L'assistant a laissé ${client.echanges.length} note${client.echanges.length > 1 ? "s" : ""} sur cet échange.`
        : "Aucune note de l'assistant n'est encore enregistrée.";
    return {
      texte: `${client.nom} a contacté votre entreprise pour « ${client.probleme} ». ${client.resume} ${notes}`,
      confiance: 96,
    };
  }

  if (texte.includes("adresse") || texte.includes("où")) {
    return {
      texte: `L'adresse de ${client.nom} est : ${client.adresse || "non renseignée"}.`,
      confiance: 97,
    };
  }

  if (
    texte.includes("téléphone") ||
    texte.includes("telephone") ||
    texte.includes("numéro") ||
    texte.includes("numero")
  ) {
    return {
      texte: `Vous pouvez joindre ${client.nom} au ${client.telephone || "numéro non renseigné"}.`,
      confiance: 98,
    };
  }

  if (texte.includes("urgent") || texte.includes("priorit")) {
    return {
      texte:
        client.urgence === "urgent"
          ? `${client.nom} est marqué comme urgent. Il vaut mieux le rappeler en priorité.`
          : `${client.nom} n'est pas marqué comme urgent. Son dossier peut être traité normalement.`,
      confiance: 95,
    };
  }

  return {
    texte: `Voici l'essentiel du dossier de ${client.nom} : ${client.probleme}. ${client.resume} Vous pouvez le joindre au ${client.telephone || "numéro non renseigné"}.`,
    confiance: 62,
  };
}

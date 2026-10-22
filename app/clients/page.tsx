"use client";

import { useState } from "react";
import { Phone, MapPin, Share2, FileDown, X, CheckCircle2, ChevronLeft } from "lucide-react";

// Types pour nos données (simulées pour l'instant)
type Client = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  address: string;
  problem: string;
  details: string;
  urgent: boolean;
  date: string;
};

const MOCK_CLIENTS: Client[] = [
  { id: "1", name: "M. Dupont", initials: "MD", phone: "06 12 34 56 78", address: "12 rue de la Paix, 75002 Paris", problem: "Fuite sous évier", details: "Le client a une fuite sous l'évier de la cuisine, l'eau coule en continu depuis ce matin. Il a peur que ça inonde le voisin du dessous.", urgent: true, date: "Aujourd'hui à 08h30" },
  { id: "2", name: "Mme Martin", initials: "MM", phone: "06 98 76 54 32", address: "45 avenue Victor Hugo, 75016 Paris", problem: "Chauffe-eau en panne", details: "Plus d'eau chaude depuis hier soir. Le voyant du chauffe-eau clignote rouge.", urgent: false, date: "Hier à 18h15" },
  { id: "3", name: "M. Bernard", initials: "MB", phone: "07 11 22 33 44", address: "8 rue des Lilas, 92100 Boulogne", problem: "Devis salle de bain", details: "Souhaite un devis pour la rénovation complète de sa salle de bain (douche italienne, carrelage).", urgent: false, date: "Il y a 2 jours" },
  { id: "4", name: "Mme Petit", initials: "MP", phone: "06 55 44 33 22", address: "3 place de la Mairie, 93100 Montreuil", problem: "WC bouché", details: "Les toilettes sont complètement bouchées, impossible de tirer la chasse.", urgent: true, date: "Il y a 3 jours" },
];

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fonction pour partager (WhatsApp, SMS, etc.)
  const handleShare = (client: Client) => {
    const text = `Fiche client Velianos:\nNom: ${client.name}\nProblème: ${client.problem}\nAdresse: ${client.address}\nTél: ${client.phone}`;
    if (navigator.share) {
      navigator.share({ title: `Client ${client.name}`, text: text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Les informations ont été copiées dans le presse-papier !");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* CONTENU PRINCIPAL - Mobile first: px-4 py-4 */}
      <main className="px-4 py-4 md:px-6 md:py-6">
        
        {/* En-tête simple - TopBar dans AppLayout gère le header sticky */}
        <div className="mb-4 md:hidden">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clients récupérés</h1>
          <p className="text-sm text-slate-500 mt-1">Toutes les demandes que votre assistant a qualifiées pour vous.</p>
        </div>
        
        <div className="hidden md:block mb-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clients récupérés</h1>
          <p className="text-sm text-slate-500 mt-1">Toutes les demandes que votre assistant a qualifiées pour vous.</p>
        </div>

        {/* LISTE DES CLIENTS - Style carte sur mobile, tableau sur desktop */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
          {/* En-tête tableau (visible sur PC) */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50/50 border-b border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Client</div>
            <div className="col-span-5">Demande</div>
            <div className="col-span-3 text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_CLIENTS.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="flex flex-col md:grid md:grid-cols-12 gap-3 px-4 py-4 items-start md:items-center hover:bg-slate-50 transition-colors text-left w-full"
            >
              <div className="flex flex-col md:grid md:grid-cols-12 gap-3 w-full">
                {/* Infos client */}
                <div className="col-span-4 flex items-center gap-3 w-full min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${client.urgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {client.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{client.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{client.phone}</p>
                  </div>
                </div>

                {/* Demande */}
                <div className="col-span-5 w-full min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{client.problem}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{client.address}</p>
                  {client.urgent && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Urgent</span>
                  )}
                </div>

                {/* Chevron / Bouton */}
                <div className="col-span-3 flex items-center justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <ChevronLeft className="w-5 h-5 text-slate-400 md:hidden" />
                  <span className="hidden md:block text-xs font-medium text-slate-500">Voir la fiche</span>
                </div>
              </div>
            </button>
))}
          </div>
        </div>
      </main>
      {/* MODALE PLEIN ÉCRAN SLIDE-UP SUR MOBILE */}
      {selectedClient && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSelectedClient(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="client-modal-title"
        >
          {/* Animation slide-up sur mobile */}
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col md:max-w-2xl md:rounded-2xl md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-h-[90vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >

            {/* En-tête de la fiche - Full width sur mobile */}
            <div className="px-4 py-4 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-2 -ml-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors md:hidden"
                  aria-label="Fermer"
                >
                  <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Récupéré par l'assistant</span>
                  </div>
                  <h2 id="client-modal-title" className="text-xl font-bold text-slate-900 truncate">{selectedClient.name}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Appel reçu {selectedClient.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors hidden md:flex">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Corps de la fiche (Scrollable) */}
            <div className="p-4 md:p-6 overflow-y-auto space-y-5 bg-slate-50 flex-1">
              
              {/* Bloc Problème */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Ce qu'il a demandé</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedClient.details}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-md">Fuite d'eau</span>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">Cuisine</span>
                </div>
              </div>

              {/* Bloc Coordonnées */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Téléphone</h3>
                  <p className="text-base font-semibold text-slate-900">{selectedClient.phone}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Adresse</h3>
                  <p className="text-base font-semibold text-slate-900">{selectedClient.address}</p>
                </div>
              </div>

            {/* Pied de la fiche (Boutons d'action) - Sticky bottom sur mobile */}
            <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 flex flex-col md:flex-row gap-3">
              <a 
                href={`tel:${selectedClient.phone.replace(/\s/g, '')}`} 
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <Phone className="w-5 h-5" /> Appeler
              </a>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedClient.address)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <MapPin className="w-5 h-5" /> Itinéraire
              </a>
              <div className="flex gap-3 flex-1">
                <button 
                  onClick={() => handleShare(selectedClient)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                  title="Partager"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                  title="Enregistrer en PDF"
                >
                  <FileDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Pour partager
function handleShare(client: Client) {
  const text = `Fiche client Velianos:\nNom: ${client.name}\nProblème: ${client.problem}\nAdresse: ${client.address}\nTél: ${client.phone}`;
  if (navigator.share) {
    navigator.share({ title: `Client ${client.name}`, text: text });
  } else {
    navigator.clipboard.writeText(text);
    alert("Les informations ont été copiées dans le presse-papier !");
  }
}
"use client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useState } from "react";

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-4xl mx-auto flex flex-col gap-16">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">
          Design System Velianos
        </h1>

        {/* Boutons */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">Boutons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Principal</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="sm">Petit</Button>
            <Button variant="primary" size="lg">Grand</Button>
            <Button variant="primary" loading>Chargement</Button>
            <Button variant="primary" disabled>Désactivé</Button>
          </div>
        </section>

        {/* Cartes */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">Cartes</h2>
          <div className="flex flex-wrap gap-4">
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Carte par défaut</h3>
              <p className="text-text-secondary text-base">Contenu de la carte avec ombre et bordure.</p>
            </Card>
            <Card variant="nova">
              <h3 className="text-lg font-semibold text-white mb-2">Carte Nova</h3>
              <p className="text-white/80 text-base">Fond Navy pour le bloc vocal de Nova.</p>
            </Card>
          </div>
        </section>

        {/* Inputs */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">Inputs</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <Input label="Nom" placeholder="Entrez votre nom" />
            <Input label="Email" type="email" placeholder="votre@email.com" />
            <Input label="Erreur" placeholder="Champ invalide" error="Ce champ est requis" />
            <Input label="Désactivé" placeholder="Non modifiable" disabled value="Constant" />
          </div>
        </section>

        {/* Badges */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="success">Succès</Badge>
            <Badge variant="warning">Avertissement</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Information</Badge>
            <Badge variant="neutral">Neutre</Badge>
          </div>
        </section>

        {/* Modale */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">Modale</h2>
          <Button onClick={() => setModalOpen(true)}>Ouvrir la modale</Button>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirmer">
            <p className="mb-4">Êtes-vous sûr de vouloir continuer ?</p>
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => setModalOpen(false)}>Confirmer</Button>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            </div>
          </Modal>
        </section>

        {/* Spinner */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">Spinner</h2>
          <Spinner size={32} />
          <Spinner size={48} />
        </section>

        {/* Empty State */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">Empty State</h2>
          <EmptyState
            title="Aucun chantier trouvé"
            description="Il semble que vous n'ayez encore aucun chantier enregistré."
            action={<Button variant="primary">Créer un chantier</Button>}
          />
        </section>
      </div>
    </main>
  );
}

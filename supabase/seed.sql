-- ============================================
-- VELIANOS - DONNÉES DE TEST (SEED)
-- ============================================
-- Ce fichier insère une entreprise fictive "Plomberie Karim" avec :
-- - 1 entreprise + 2 utilisateurs
-- - 6 clients
-- - 3 zones d'intervention
-- - 4 tarifs
-- - 5 rendez-vous
-- - 3 appels avec transcripts
-- - 3 messages SMS
-- - 2 notifications
-- ============================================

-- Nettoyage (pour pouvoir relancer le seed plusieurs fois)
DELETE FROM notifications WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM messages WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM nova_actions WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM transcripts WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM calls WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM appointments WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM pricing_rules WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM zones WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM clients WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name = 'Plomberie Karim');
DELETE FROM companies WHERE name = 'Plomberie Karim';

-- ============================================
-- 1. ENTREPRISE
-- ============================================

INSERT INTO companies (
  id, name, siret, phone, vapi_phone_number, address, city, postal_code,
  working_hours, subscription_plan, subscription_status, trial_ends_at, onboarding_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Plomberie Karim',
  '123 456 789 00012',
  '06 12 34 56 78',
  '+33428123456',
  '12 rue de la République',
  'Lyon',
  '69003',
  '{"lundi": {"start": "08:00", "end": "18:00"}, "mardi": {"start": "08:00", "end": "18:00"}, "mercredi": {"start": "08:00", "end": "18:00"}, "jeudi": {"start": "08:00", "end": "18:00"}, "vendredi": {"start": "08:00", "end": "18:00"}, "samedi": null, "dimanche": null}'::jsonb,
  'pro',
  'trialing',
  NOW() + INTERVAL '5 days',
  true
);

-- ============================================
-- 2. UTILISATEURS
-- ============================================
-- Note : On ne crée pas de vraies entrées auth.users ici car ça nécessite l'API Auth.
-- Ces users seront liés quand un vrai utilisateur s'inscrira via Supabase Auth.
-- Pour les tests, on peut les insérer mais il faudra créer les users Auth correspondants.

-- On insère uniquement les profils users avec des UUID fixes pour les tests
INSERT INTO users (id, company_id, role, first_name, last_name, email, phone, is_active) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'admin', 'Karim', 'Benali', 'karim@plomberie-karim.fr', '06 12 34 56 78', true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'employee', 'Sarah', 'Lefebvre', 'sarah@plomberie-karim.fr', '06 23 45 67 89', true);

-- ============================================
-- 3. CLIENTS
-- ============================================

INSERT INTO clients (id, company_id, first_name, last_name, phone, email, address, city, postal_code, notes, source) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Marie', 'Dupont', '06 11 22 33 44', 'marie.dupont@email.fr', '5 rue Garibaldi', 'Lyon', '69003', 'Cliente fidèle depuis 2022', 'nova_call'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Pierre', 'Martin', '06 22 33 44 55', 'pierre.martin@email.fr', '18 avenue Jean Jaurès', 'Villeurbanne', '69100', NULL, 'nova_call'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'Sophie', 'Bernard', '06 33 44 55 66', NULL, '42 cours Vitton', 'Lyon', '69006', 'Souhaite un devis rénovation', 'nova_call'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'Isabelle', 'Rousseau', '06 44 55 66 77', 'i.rousseau@email.fr', '7 place Bellecour', 'Lyon', '69002', NULL, 'nova_chat'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', 'Thomas', 'Petit', '06 55 66 77 88', NULL, '23 rue de la Part-Dieu', 'Lyon', '69003', NULL, 'nova_call'),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', 'Céline', 'Moreau', '06 66 77 88 99', 'celine.moreau@email.fr', '9 quai Claude Bernard', 'Lyon', '69007', NULL, 'nova_chat');

-- ============================================
-- 4. ZONES D'INTERVENTION
-- ============================================

INSERT INTO zones (company_id, city, postal_code, radius_km, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Lyon', NULL, 10, true),
  ('00000000-0000-0000-0000-000000000001', 'Villeurbanne', '69100', NULL, true),
  ('00000000-0000-0000-0000-000000000001', 'Caluire-et-Cuire', '69300', NULL, true);

-- ============================================
-- 5. GRILLE TARIFAIRE
-- ============================================

INSERT INTO pricing_rules (company_id, label, min_price_cents, max_price_cents, notes, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Débouchage évier', 8000, 15000, 'Selon la complexité', true),
  ('00000000-0000-0000-0000-000000000001', 'Remplacement chauffe-eau', 40000, 80000, 'Selon le modèle', true),
  ('00000000-0000-0000-0000-000000000001', 'Recherche de fuite', 15000, 30000, 'Déplacement inclus', true),
  ('00000000-0000-0000-0000-000000000001', 'Entretien chaudière annuel', 12000, 18000, 'Contrat annuel possible', true);

-- ============================================
-- 6. RENDEZ-VOUS
-- ============================================

INSERT INTO appointments (company_id, client_id, assigned_user_id, title, description, address, start_at, end_at, status, source, estimated_price_min_cents, estimated_price_max_cents, urgency) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Fuite sous évier cuisine', 'Fuite d''eau sous l''évier, eau qui coule en continu', '5 rue Garibaldi, Lyon 3e', NOW() + INTERVAL '1 day' + INTERVAL '9 hours', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', 'confirmed', 'nova_call', 15000, 30000, 'urgent'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Installation chauffe-eau', 'Remplacement chauffe-eau électrique 200L', '18 avenue Jean Jaurès, Villeurbanne', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '2 days' + INTERVAL '16 hours', 'confirmed', 'nova_call', 40000, 80000, 'normal'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', 'Devis rénovation SDB', 'Devis pour rénovation complète salle de bain 6m²', '42 cours Vitton, Lyon 6e', NOW() + INTERVAL '3 days' + INTERVAL '11 hours', NOW() + INTERVAL '3 days' + INTERVAL '12 hours', 'pending', 'nova_call', NULL, NULL, 'normal'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000102', 'Entretien chaudière annuel', 'Entretien annuel obligatoire', '7 place Bellecour, Lyon 2e', NOW() + INTERVAL '5 days' + INTERVAL '9 hours', NOW() + INTERVAL '5 days' + INTERVAL '10 hours', 'confirmed', 'nova_chat', 12000, 18000, 'normal'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000101', 'Débouchage évier', 'Évier de cuisine bouché', '23 rue de la Part-Dieu, Lyon 3e', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 'completed', 'nova_call', 8000, 15000, 'normal');

-- ============================================
-- 7. APPELS
-- ============================================

INSERT INTO calls (id, company_id, vapi_call_id, client_id, from_number, to_number, direction, status, started_at, ended_at, duration_seconds, cost_cents, summary, outcome) VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'vapi_call_test_001', '00000000-0000-0000-0000-000000000201', '06 11 22 33 44', '+33428123456', 'inbound', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes 30 seconds', 150, 30, 'Mme Dupont a appelé pour une fuite sous son évier. RDV pris pour demain 9h.', 'appointment_booked'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'vapi_call_test_002', '00000000-0000-0000-0000-000000000202', '06 22 33 44 55', '+33428123456', 'inbound', 'completed', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours' + INTERVAL '1 minute 45 seconds', 105, 21, 'M. Martin a appelé pour un chauffe-eau à remplacer. RDV pris pour après-demain 14h.', 'appointment_booked'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', 'vapi_call_test_003', '00000000-0000-0000-0000-000000000203', '06 33 44 55 66', '+33428123456', 'inbound', 'completed', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours' + INTERVAL '3 minutes 10 seconds', 190, 38, 'Mme Bernard a demandé un devis pour une rénovation de salle de bain. Nova n''a pas pu chiffrer, demande de rappel.', 'transferred');

-- ============================================
-- 8. TRANSCRIPTS (extraits)
-- ============================================

-- Appel 1 : Mme Dupont (fuite évier)
INSERT INTO transcripts (call_id, company_id, role, content, timestamp_ms) VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'assistant', 'Bonjour, je suis Nova, l''assistante numérique de Plomberie Karim. Comment puis-je vous aider ?', 0),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'user', 'Bonjour, j''ai une fuite d''eau sous mon évier de cuisine.', 5000),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'assistant', 'Je comprends. Pouvez-vous me donner votre adresse pour que je vérifie si vous êtes dans notre zone d''intervention ?', 10000),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'user', 'Oui, 5 rue Garibaldi à Lyon.', 15000),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'assistant', 'Parfait, vous êtes bien dans notre zone. Nous avons un créneau demain à 9h00. Cela vous conviendrait-il ?', 20000),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'user', 'Oui, c''est parfait.', 25000),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'assistant', 'C''est noté. Rendez-vous confirmé demain à 9h00. Un rappel vous sera envoyé. Bonne journée !', 30000);

-- ============================================
-- 9. MESSAGES SMS
-- ============================================

INSERT INTO messages (company_id, client_id, to_number, from_number, body, direction, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', '06 11 22 33 44', '+33428123456', 'Bonjour Mme Dupont, votre rendez-vous est confirmé pour demain à 9h00. À bientôt. Plomberie Karim', 'outbound', 'delivered'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', '06 22 33 44 55', '+33428123456', 'Bonjour M. Martin, votre rendez-vous est confirmé pour après-demain à 14h00. À bientôt. Plomberie Karim', 'outbound', 'delivered'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000204', '06 44 55 66 77', '+33428123456', 'Bonjour Mme Rousseau, votre rendez-vous d''entretien est confirmé. À bientôt. Plomberie Karim', 'outbound', 'sent');

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================

INSERT INTO notifications (company_id, user_id, type, title, body) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'appointment_booked', 'Nouveau RDV pris par Nova', 'Mme Dupont — Fuite sous évier, demain à 9h00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'needs_attention', 'Nova a besoin de vous', 'Mme Bernard demande un devis pour une rénovation de salle de bain.');

-- ============================================
-- FIN DU SEED
-- ============================================

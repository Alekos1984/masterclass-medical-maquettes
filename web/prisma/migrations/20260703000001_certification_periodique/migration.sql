-- Certification périodique : référentiel + compte utilisateur + justificatifs

CREATE TABLE IF NOT EXISTS "CertificationBloc" (
    "code" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "actionsRequises" INTEGER NOT NULL DEFAULT 2,
    "exemples" JSONB NOT NULL,
    "justificatifs" JSONB NOT NULL,
    CONSTRAINT "CertificationBloc_pkey" PRIMARY KEY ("code")
);

CREATE TABLE IF NOT EXISTS "CertificationActionRef" (
    "id" TEXT NOT NULL,
    "blocCode" TEXT NOT NULL,
    "specialite" TEXT,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "typeJustificatif" TEXT,
    CONSTRAINT "CertificationActionRef_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CertificationActionRef_blocCode_fkey" FOREIGN KEY ("blocCode") REFERENCES "CertificationBloc"("code") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CertificationActionRef_blocCode_specialite_idx" ON "CertificationActionRef"("blocCode", "specialite");

CREATE TABLE IF NOT EXISTS "CertificationCompte" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialite" TEXT,
    "anneeDES" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CertificationCompte_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CertificationCompte_userId_key" ON "CertificationCompte"("userId");

CREATE TABLE IF NOT EXISTS "CertificationJustificatif" (
    "id" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "blocCode" TEXT NOT NULL,
    "actionTitre" TEXT NOT NULL,
    "typeDocument" TEXT,
    "fichierNom" TEXT,
    "fichierBase64" TEXT,
    "url" TEXT,
    "source" TEXT NOT NULL DEFAULT 'UPLOAD',
    "formationId" TEXT,
    "dateAction" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CertificationJustificatif_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CertificationJustificatif_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "CertificationCompte"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CertificationJustificatif_compteId_formationId_key" ON "CertificationJustificatif"("compteId", "formationId");
CREATE INDEX IF NOT EXISTS "CertificationJustificatif_compteId_blocCode_idx" ON "CertificationJustificatif"("compteId", "blocCode");

ALTER TABLE "Formation" ADD COLUMN IF NOT EXISTS "certifBlocCode" TEXT;
ALTER TABLE "Formation" ADD COLUMN IF NOT EXISTS "certifActionTitre" TEXT;

-- ─── SEED : référentiel base commune (ordonnance n° 2021-961 du 19 juillet 2021) ───

INSERT INTO "CertificationBloc" ("code", "ordre", "titre", "description", "emoji", "couleur", "actionsRequises", "exemples", "justificatifs") VALUES
(
  'COGNITIF', 1,
  'Actualiser ses connaissances et compétences',
  'Maintenir et développer son savoir médical tout au long de sa carrière : formation continue, congrès, diplômes universitaires, e-learning, simulation en santé. C''est le cœur du développement professionnel continu.',
  '📚', '#1565c0', 2,
  '["Formation continue (DPC, FMC) présentielle ou en ligne", "Participation à un congrès ou une journée scientifique de la spécialité", "Diplôme universitaire (DU) ou inter-universitaire (DIU)", "Formation par simulation en santé", "Masterclass ou atelier pratique de perfectionnement", "Lecture critique d''articles avec évaluation des connaissances"]'::jsonb,
  '["Attestation de participation ou de fin de formation", "Certificat de réalisation", "Diplôme obtenu (DU/DIU)", "Attestation DPC (agence nationale du DPC)"]'::jsonb
),
(
  'QUALITE', 2,
  'Renforcer la qualité de ses pratiques professionnelles',
  'Évaluer et améliorer concrètement sa pratique : analyse des pratiques entre pairs, revues de morbi-mortalité, accréditation, audits cliniques, participation à des registres et démarches qualité.',
  '🎯', '#2e7d32', 2,
  '["Groupe d''analyse de pratiques entre pairs", "Revue de morbi-mortalité (RMM)", "Participation à des réunions de concertation pluridisciplinaire (RCP)", "Accréditation des médecins (spécialités à risque, HAS)", "Audit clinique ou suivi d''indicateurs de pratique", "Participation à un registre ou une base de données de spécialité"]'::jsonb,
  '["Attestation de participation au groupe de pairs", "Attestation RMM / RCP", "Certificat d''accréditation HAS", "Rapport d''audit ou attestation de participation"]'::jsonb
),
(
  'RELATION', 3,
  'Améliorer la relation avec ses patients',
  'Développer la qualité de la communication et de l''information du patient : annonce de diagnostic, décision médicale partagée, éducation thérapeutique, prise en compte de l''expérience patient.',
  '🤝', '#e65100', 2,
  '["Formation à la communication ou à l''annonce d''une mauvaise nouvelle", "Formation à la décision médicale partagée", "Programme d''éducation thérapeutique du patient (ETP)", "Recueil et analyse de questionnaires d''expérience / satisfaction patients", "Formation à la gestion des situations difficiles ou conflictuelles", "Formation aux droits des patients et à l''éthique médicale"]'::jsonb,
  '["Attestation de formation", "Certificat de réalisation", "Attestation de participation à un programme ETP", "Synthèse anonymisée d''enquête patients"]'::jsonb
),
(
  'SANTE', 4,
  'Mieux prendre en compte sa santé personnelle',
  'Prendre soin de sa propre santé pour mieux soigner : suivi médical régulier, prévention de l''épuisement professionnel, gestion des risques psycho-sociaux, équilibre vie professionnelle / vie personnelle.',
  '🩺', '#7b1fa2', 2,
  '["Visite auprès de la médecine du travail ou d''un médecin traitant", "Bilan de santé ou bilan de prévention", "Formation à la prévention de l''épuisement professionnel (burn-out)", "Formation à la gestion du stress et des risques psycho-sociaux", "Mise à jour de sa couverture vaccinale", "Participation à un groupe de parole ou dispositif d''entraide entre soignants"]'::jsonb,
  '["Attestation de visite médicale", "Attestation de suivi ou de bilan", "Attestation de formation", "Attestation sur l''honneur (le cas échéant)"]'::jsonb
)
ON CONFLICT ("code") DO NOTHING;

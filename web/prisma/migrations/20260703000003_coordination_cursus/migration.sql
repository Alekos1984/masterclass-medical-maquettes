-- Coordination d'enseignement (DU / cursus multi-journées)

CREATE TABLE IF NOT EXISTS "Cursus" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specialite" TEXT NOT NULL,
    "annee" TEXT,
    "publique" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "inscriptionMode" TEXT NOT NULL DEFAULT 'IMPORT',
    "prixHT" DECIMAL(10,2),
    "lieuNom" TEXT,
    "lieuAdresse" TEXT,
    "lieuVille" TEXT,
    "certifBlocCode" TEXT,
    "certifActionTitre" TEXT,
    "coordinateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cursus_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Cursus_coordinateurId_fkey" FOREIGN KEY ("coordinateurId") REFERENCES "FormateurProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Cursus_slug_key" ON "Cursus"("slug");

CREATE TABLE IF NOT EXISTS "CursusEnseignant" (
    "id" TEXT NOT NULL,
    "cursusId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT,
    "formateurId" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "inviteToken" TEXT NOT NULL,
    "coCoordinateur" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursusEnseignant_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CursusEnseignant_cursusId_fkey" FOREIGN KEY ("cursusId") REFERENCES "Cursus"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CursusEnseignant_inviteToken_key" ON "CursusEnseignant"("inviteToken");
CREATE UNIQUE INDEX IF NOT EXISTS "CursusEnseignant_cursusId_email_key" ON "CursusEnseignant"("cursusId", "email");

CREATE TABLE IF NOT EXISTS "CursusMessage" (
    "id" TEXT NOT NULL,
    "cursusId" TEXT NOT NULL,
    "auteurEmail" TEXT NOT NULL,
    "auteurNom" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursusMessage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CursusMessage_cursusId_fkey" FOREIGN KEY ("cursusId") REFERENCES "Cursus"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CursusEchange" (
    "id" TEXT NOT NULL,
    "cursusId" TEXT NOT NULL,
    "deEnseignantId" TEXT NOT NULL,
    "versEnseignantId" TEXT NOT NULL,
    "journeeAId" TEXT NOT NULL,
    "slotIdA" TEXT NOT NULL,
    "journeeBId" TEXT NOT NULL,
    "slotIdB" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "decideAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursusEchange_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CursusEchange_cursusId_fkey" FOREIGN KEY ("cursusId") REFERENCES "Cursus"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CursusRappel" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursusRappel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CursusRappel_formationId_email_type_key" ON "CursusRappel"("formationId", "email", "type");

ALTER TABLE "Formation" ADD COLUMN IF NOT EXISTS "cursusId" TEXT;
ALTER TABLE "Formation" ADD COLUMN IF NOT EXISTS "visioUrl" TEXT;
ALTER TABLE "Ressource" ADD COLUMN IF NOT EXISTS "slotId" TEXT;

DO $$ BEGIN
    ALTER TABLE "Formation" ADD CONSTRAINT "Formation_cursusId_fkey" FOREIGN KEY ("cursusId") REFERENCES "Cursus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

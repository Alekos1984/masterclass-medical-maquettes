-- Validation du DU : modules d'évaluation, notes, historique d'audit

CREATE TABLE IF NOT EXISTS "CursusValidationModule" (
    "id" TEXT NOT NULL,
    "cursusId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "dateEpreuve" TIMESTAMP(3),
    "infos" TEXT,
    "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "noteMax" INTEGER NOT NULL DEFAULT 20,
    "seuilValidation" DOUBLE PRECISION,
    "cloture" BOOLEAN NOT NULL DEFAULT false,
    "clotureAt" TIMESTAMP(3),
    "clotureExportUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CursusValidationModule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CursusValidationModule_cursusId_fkey" FOREIGN KEY ("cursusId") REFERENCES "Cursus"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CursusNote" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "note" DOUBLE PRECISION,
    "commentaire" TEXT,
    "saisiParUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CursusNote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CursusNote_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CursusValidationModule"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CursusNote_moduleId_participantId_key" ON "CursusNote"("moduleId", "participantId");

CREATE TABLE IF NOT EXISTS "CursusNoteHistorique" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "noteAvant" DOUBLE PRECISION,
    "noteApres" DOUBLE PRECISION,
    "commentaireAvant" TEXT,
    "commentaireApres" TEXT,
    "parUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursusNoteHistorique_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CursusNoteHistorique_moduleId_participantId_idx" ON "CursusNoteHistorique"("moduleId", "participantId");

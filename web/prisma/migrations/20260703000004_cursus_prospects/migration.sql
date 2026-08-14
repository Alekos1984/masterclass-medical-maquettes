-- Liste d'attente (CRM) + champs phone/fonction sur les enseignants de cursus

CREATE TABLE IF NOT EXISTS "CursusProspect" (
    "id" TEXT NOT NULL,
    "cursusId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "phone" TEXT,
    "fonction" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CursusProspect_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CursusProspect_cursusId_fkey" FOREIGN KEY ("cursusId") REFERENCES "Cursus"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CursusProspect_cursusId_email_key" ON "CursusProspect"("cursusId", "email");

ALTER TABLE "CursusEnseignant" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "CursusEnseignant" ADD COLUMN IF NOT EXISTS "fonction" TEXT;

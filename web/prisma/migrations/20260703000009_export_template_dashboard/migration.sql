ALTER TABLE "CursusProspect" ADD COLUMN IF NOT EXISTS "piecesJointes" JSONB;
ALTER TABLE "Cursus" ADD COLUMN IF NOT EXISTS "capaciteMax" INTEGER;
ALTER TABLE "Cursus" ADD COLUMN IF NOT EXISTS "templateOrigineId" TEXT;

CREATE TABLE IF NOT EXISTS "CursusTemplate" (
    "id" TEXT NOT NULL,
    "formateurId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "specialite" TEXT,
    "description" TEXT,
    "emargementMode" TEXT NOT NULL DEFAULT 'DEMI_JOURNEE',
    "organisateursTexte" TEXT,
    "contactNom" TEXT,
    "contactEmail" TEXT,
    "contactTelephone" TEXT,
    "certifBlocCode" TEXT,
    "certifActionTitre" TEXT,
    "modulesValidation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CursusTemplate_pkey" PRIMARY KEY ("id")
);

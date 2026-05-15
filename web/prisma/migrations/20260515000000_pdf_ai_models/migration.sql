-- CompanySettings (singleton)
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "raisonSociale" TEXT NOT NULL DEFAULT 'Masterclass Medical',
    "siret" TEXT,
    "numeroDeclaration" TEXT,
    "adresse" TEXT,
    "codePostal" TEXT,
    "ville" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "representantLegal" TEXT,
    "siteWeb" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- SatisfactionReponse
CREATE TABLE "SatisfactionReponse" (
    "id" TEXT NOT NULL,
    "inscriptionId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "noteContenu" INTEGER,
    "noteFormateur" INTEGER,
    "noteOrganisation" INTEGER,
    "noteSupport" INTEGER,
    "noteGlobal" INTEGER,
    "objectifsAtteints" BOOLEAN,
    "recommanderait" BOOLEAN,
    "pointsForts" TEXT,
    "pointsAmelioration" TEXT,
    "commentaireLibre" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SatisfactionReponse_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "SatisfactionReponse_inscriptionId_key" ON "SatisfactionReponse"("inscriptionId");

-- Foreign keys
ALTER TABLE "SatisfactionReponse" ADD CONSTRAINT "SatisfactionReponse_inscriptionId_fkey"
    FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SatisfactionReponse" ADD CONSTRAINT "SatisfactionReponse_formationId_fkey"
    FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

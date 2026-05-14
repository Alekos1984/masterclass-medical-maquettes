-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARTICIPANT', 'FORMATEUR', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatutFormation" AS ENUM ('BROUILLON', 'EN_ATTENTE_SALLE', 'SALLE_CONFIRMEE', 'PUBLIEE', 'COMPLETE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('EN_ATTENTE_PAIEMENT', 'CONFIRMEE', 'ANNULEE', 'REMBOURSEE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'CAPTE', 'REMBOURSE', 'ECHOUE');

-- CreateEnum
CREATE TYPE "TypePaiement" AS ENUM ('INSCRIPTION', 'FRAIS_SALLE', 'ABONNEMENT');

-- CreateEnum
CREATE TYPE "StatutDemandeSalle" AS ENUM ('EN_ATTENTE', 'CONTACT_HOTEL', 'DEVIS_RECU', 'VALIDE', 'TRANSMIS_FORMATEUR', 'PAYE');

-- CreateEnum
CREATE TYPE "StatutVirement" AS ENUM ('EN_ATTENTE', 'EFFECTUE');

-- CreateEnum
CREATE TYPE "StatutRemboursement" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE', 'EFFECTUE');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('INACTIF', 'ACTIF', 'SUSPENDU', 'RESILIE');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PARTICIPANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormateurProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titre" TEXT,
    "specialite" TEXT,
    "rpps" TEXT,
    "phone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "codePostal" TEXT,
    "bio" TEXT,
    "experienceAns" INTEGER,
    "publications" INTEGER DEFAULT 0,
    "linkedinUrl" TEXT,
    "researchgateUrl" TEXT,
    "pubmedUrl" TEXT,
    "siret" TEXT,
    "raisonSociale" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "stripeCustomerId" TEXT,
    "stripeAccountId" TEXT,
    "statutAbonnement" "StatutAbonnement" NOT NULL DEFAULT 'INACTIF',
    "stripeSubscriptionId" TEXT,
    "abonnementDebut" TIMESTAMP(3),
    "abonnementFin" TIMESTAMP(3),
    "formationsTotal" INTEGER NOT NULL DEFAULT 0,
    "portfolioPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormateurProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titre" TEXT,
    "specialite" TEXT,
    "rpps" TEXT,
    "phone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "codePostal" TEXT,
    "pays" TEXT DEFAULT 'France',
    "stripeCustomerId" TEXT,
    "notifEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifRappels" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "formateurId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "specialite" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectifs" JSONB NOT NULL,
    "programme" JSONB NOT NULL,
    "bibliographie" JSONB,
    "date" TIMESTAMP(3) NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "dureeHeures" INTEGER NOT NULL,
    "placesTotal" INTEGER NOT NULL,
    "placesRestantes" INTEGER NOT NULL,
    "lieuNom" TEXT,
    "lieuAdresse" TEXT,
    "lieuVille" TEXT,
    "lieuSalle" TEXT,
    "lieuFeatures" JSONB,
    "prixHT" DECIMAL(10,2) NOT NULL,
    "exonerationTVA" BOOLEAN NOT NULL DEFAULT true,
    "statut" "StatutFormation" NOT NULL DEFAULT 'BROUILLON',
    "conflitsInterets" TEXT,
    "declarationCoi" BOOLEAN NOT NULL DEFAULT false,
    "programmeDocUrl" TEXT,
    "supportCoursUrl" TEXT,
    "gratuite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandeSalle" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "statut" "StatutDemandeSalle" NOT NULL DEFAULT 'EN_ATTENTE',
    "hotelNom" TEXT,
    "hotelEmail" TEXT,
    "hotelPhone" TEXT,
    "emailEnvoye" BOOLEAN NOT NULL DEFAULT false,
    "dateContact" TIMESTAMP(3),
    "devisHT" DECIMAL(10,2),
    "fraisGestion" DECIMAL(10,2),
    "totalHT" DECIMAL(10,2),
    "devisUrl" TEXT,
    "dateDevis" TIMESTAMP(3),
    "dateValidation" TIMESTAMP(3),
    "dateTransmission" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandeSalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscription" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "statut" "StatutInscription" NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
    "montantHT" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "netFormateur" DECIMAL(10,2) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeSessionId" TEXT,
    "conventionSignee" BOOLEAN NOT NULL DEFAULT false,
    "conventionUrl" TEXT,
    "attestationUrl" TEXT,
    "noteSatisfaction" INTEGER,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "type" "TypePaiement" NOT NULL,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "montantHT" DECIMAL(10,2) NOT NULL,
    "stripeFees" DECIMAL(10,2),
    "stripeId" TEXT,
    "inscriptionId" TEXT,
    "demandeSalleId" TEXT,
    "formationId" TEXT,
    "numeroFacture" TEXT,
    "factureUrl" TEXT,
    "datePaiement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Virement" (
    "id" TEXT NOT NULL,
    "formateurId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "montantNet" DECIMAL(10,2) NOT NULL,
    "statut" "StatutVirement" NOT NULL DEFAULT 'EN_ATTENTE',
    "stripeTransferId" TEXT,
    "ibanDestinataire" TEXT,
    "dateVirement" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Virement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remboursement" (
    "id" TEXT NOT NULL,
    "inscriptionId" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "statut" "StatutRemboursement" NOT NULL DEFAULT 'EN_ATTENTE',
    "montant" DECIMAL(10,2) NOT NULL,
    "eligible" BOOLEAN NOT NULL,
    "raisonRefus" TEXT,
    "stripeRefundId" TEXT,
    "dateDemande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTraitement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remboursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emargement" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "inscriptionId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExpire" TIMESTAMP(3) NOT NULL,
    "presentMatin" BOOLEAN NOT NULL DEFAULT false,
    "presentApresMidi" BOOLEAN NOT NULL DEFAULT false,
    "signatureMatin" TIMESTAMP(3),
    "signatureApresMidi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emargement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FormateurProfile_userId_key" ON "FormateurProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FormateurProfile_rpps_key" ON "FormateurProfile"("rpps");

-- CreateIndex
CREATE UNIQUE INDEX "FormateurProfile_stripeCustomerId_key" ON "FormateurProfile"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "FormateurProfile_stripeAccountId_key" ON "FormateurProfile"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "FormateurProfile_stripeSubscriptionId_key" ON "FormateurProfile"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantProfile_userId_key" ON "ParticipantProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantProfile_stripeCustomerId_key" ON "ParticipantProfile"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_slug_key" ON "Formation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DemandeSalle_formationId_key" ON "DemandeSalle"("formationId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_stripePaymentIntentId_key" ON "Inscription"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_stripeSessionId_key" ON "Inscription"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_participantId_formationId_key" ON "Inscription"("participantId", "formationId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_stripeId_key" ON "Paiement"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_inscriptionId_key" ON "Paiement"("inscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_demandeSalleId_key" ON "Paiement"("demandeSalleId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_numeroFacture_key" ON "Paiement"("numeroFacture");

-- CreateIndex
CREATE UNIQUE INDEX "Virement_stripeTransferId_key" ON "Virement"("stripeTransferId");

-- CreateIndex
CREATE UNIQUE INDEX "Remboursement_inscriptionId_key" ON "Remboursement"("inscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Remboursement_stripeRefundId_key" ON "Remboursement"("stripeRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "Emargement_token_key" ON "Emargement"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Emargement_formationId_inscriptionId_key" ON "Emargement"("formationId", "inscriptionId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormateurProfile" ADD CONSTRAINT "FormateurProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantProfile" ADD CONSTRAINT "ParticipantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "FormateurProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeSalle" ADD CONSTRAINT "DemandeSalle_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ParticipantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_demandeSalleId_fkey" FOREIGN KEY ("demandeSalleId") REFERENCES "DemandeSalle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Virement" ADD CONSTRAINT "Virement_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "FormateurProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Virement" ADD CONSTRAINT "Virement_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remboursement" ADD CONSTRAINT "Remboursement_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emargement" ADD CONSTRAINT "Emargement_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emargement" ADD CONSTRAINT "Emargement_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


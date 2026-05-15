ALTER TABLE "Emargement" ADD COLUMN "pvParticipantSignedAt" TIMESTAMP(3);
ALTER TABLE "Emargement" ADD COLUMN "pvParticipantSignatureBase64" TEXT;
ALTER TABLE "Emargement" ADD COLUMN "correctionPresence" BOOLEAN;
ALTER TABLE "Emargement" ADD COLUMN "correctionJustification" TEXT;
ALTER TABLE "ParticipantProfile" ADD COLUMN "signatureBase64" TEXT;
ALTER TABLE "Formation" ADD COLUMN "emargementSigne" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Formation" ADD COLUMN "emargementSigneAt" TIMESTAMP(3);

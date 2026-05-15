ALTER TABLE "Formation" ADD COLUMN "sessionLog" JSONB;
ALTER TABLE "Formation" ADD COLUMN "pvSigne" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Formation" ADD COLUMN "pvSigneAt" TIMESTAMP(3);
ALTER TABLE "Formation" ADD COLUMN "bilanSigne" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Formation" ADD COLUMN "bilanSigneAt" TIMESTAMP(3);
ALTER TABLE "Formation" ADD COLUMN "certificatSigne" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Formation" ADD COLUMN "certificatSigneAt" TIMESTAMP(3);
ALTER TABLE "FormateurProfile" ADD COLUMN "signatureBase64" TEXT;

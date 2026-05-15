ALTER TABLE "Formation" ADD COLUMN "formatFormation" TEXT;
ALTER TABLE "Formation" ADD COLUMN "minParticipants" INTEGER DEFAULT 8;
ALTER TABLE "Formation" ADD COLUMN "equipements" JSONB;

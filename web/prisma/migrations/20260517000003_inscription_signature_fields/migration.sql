ALTER TABLE "Inscription"
  ADD COLUMN IF NOT EXISTS "convocationSigneeAt"           TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "convocationAccuseAt"           TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "conventionSigneeAt"            TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "conventionParticipantSigneeAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "conventionSeal"                TEXT;

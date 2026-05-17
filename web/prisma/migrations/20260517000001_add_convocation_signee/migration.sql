-- AlterTable
ALTER TABLE "Inscription" ADD COLUMN IF NOT EXISTS "convocationSignee" BOOLEAN NOT NULL DEFAULT false;

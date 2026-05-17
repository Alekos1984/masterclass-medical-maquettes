-- Virtual classroom fields on Formation
ALTER TABLE "Formation"
  ADD COLUMN IF NOT EXISTS "modaliteSession"     TEXT,
  ADD COLUMN IF NOT EXISTS "sessionCurrentPage"  INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "sessionSlidesBase64" TEXT;

-- Questions from participants during live session
CREATE TABLE IF NOT EXISTS "Question" (
  "id"            TEXT NOT NULL,
  "formationId"   TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "texte"         TEXT NOT NULL,
  "lue"           BOOLEAN NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Question_formationId_fkey"   FOREIGN KEY ("formationId")   REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Question_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ParticipantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Resources uploaded by formateur
CREATE TABLE IF NOT EXISTS "Ressource" (
  "id"          TEXT NOT NULL,
  "formationId" TEXT NOT NULL,
  "nom"         TEXT NOT NULL,
  "fileBase64"  TEXT,
  "url"         TEXT,
  "taille"      INTEGER,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Ressource_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Ressource_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

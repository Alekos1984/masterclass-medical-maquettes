-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "formateurId" TEXT NOT NULL,
    "pmid" TEXT,
    "titre" TEXT NOT NULL,
    "auteurs" TEXT NOT NULL,
    "revue" TEXT,
    "annee" INTEGER,
    "doi" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Publication_formateurId_pmid_key" ON "Publication"("formateurId", "pmid");

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "FormateurProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

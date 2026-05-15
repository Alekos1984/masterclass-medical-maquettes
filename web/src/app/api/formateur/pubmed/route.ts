import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — return saved publications for this formateur
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const pubs = await prisma.publication.findMany({
    where: { formateurId: profil.id },
    orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(pubs);
}

// POST — search PubMed, fetch details, upsert into DB, update count
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const { query } = await req.json() as { query: string };
  if (!query?.trim()) return NextResponse.json({ error: "Requête manquante" }, { status: 400 });

  const pubmedSearchUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query + "[Author]")}`;

  // 1. Search PMIDs
  const searchRes = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query + "[Author]")}&retmax=50&retmode=json`,
    { headers: { "User-Agent": "MasterclassMedical/1.0" } }
  );
  if (!searchRes.ok) return NextResponse.json({ error: "Erreur PubMed" }, { status: 502 });

  const searchData = await searchRes.json() as { esearchresult?: { idlist?: string[]; count?: string } };
  const ids: string[] = searchData.esearchresult?.idlist ?? [];
  const totalCount = parseInt(searchData.esearchresult?.count ?? "0", 10);

  if (ids.length === 0) {
    return NextResponse.json({ imported: 0, total: 0, searchUrl: pubmedSearchUrl });
  }

  // 2. Fetch summaries
  const summaryRes = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`,
    { headers: { "User-Agent": "MasterclassMedical/1.0" } }
  );
  if (!summaryRes.ok) return NextResponse.json({ error: "Erreur PubMed summary" }, { status: 502 });

  type PubMedArticle = {
    uid: string;
    title?: string;
    authors?: { name: string }[];
    source?: string;
    pubdate?: string;
    elocationid?: string;
  };
  const summaryData = await summaryRes.json() as { result?: Record<string, PubMedArticle> };
  const result = summaryData.result ?? {};

  // 3. Upsert into DB
  let imported = 0;
  for (const pmid of ids) {
    const art = result[pmid];
    if (!art || !art.uid) continue;

    const auteurs = (art.authors ?? []).map((a) => a.name).join(", ");
    const anneeStr = art.pubdate?.match(/\d{4}/)?.[0];
    const annee = anneeStr ? parseInt(anneeStr, 10) : null;
    const doi = art.elocationid?.includes("doi")
      ? art.elocationid.replace(/doi:\s*/i, "").trim()
      : null;

    await prisma.publication.upsert({
      where: { formateurId_pmid: { formateurId: profil.id, pmid } },
      update: {
        titre: art.title ?? "Sans titre",
        auteurs: auteurs || "Auteurs inconnus",
        revue: art.source ?? null,
        annee,
        doi,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      },
      create: {
        formateurId: profil.id,
        pmid,
        titre: art.title ?? "Sans titre",
        auteurs: auteurs || "Auteurs inconnus",
        revue: art.source ?? null,
        annee,
        doi,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      },
    });
    imported++;
  }

  // 4. Update publications count + pubmedUrl on profile
  await prisma.formateurProfile.update({
    where: { id: profil.id },
    data: { publications: totalCount, pubmedUrl: pubmedSearchUrl },
  });

  return NextResponse.json({ imported, total: totalCount, searchUrl: pubmedSearchUrl });
}

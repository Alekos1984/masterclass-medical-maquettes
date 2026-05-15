import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Paramètre query manquant" }, { status: 400 });
  }

  const searchUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query + "[Author]")}`;

  try {
    const pubmedRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query + "[Author]")}&retmax=10&retmode=json`
    );

    if (!pubmedRes.ok) {
      throw new Error(`PubMed API error: ${pubmedRes.status}`);
    }

    const data = await pubmedRes.json();
    const count: number = parseInt(data?.esearchresult?.count ?? "0", 10);
    const ids: string[] = data?.esearchresult?.idlist ?? [];

    return NextResponse.json({ count, ids, searchUrl });
  } catch (err) {
    console.error("PubMed fetch error:", err);
    return NextResponse.json({ error: "Erreur lors de la recherche PubMed" }, { status: 502 });
  }
}

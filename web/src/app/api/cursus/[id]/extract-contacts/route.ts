import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCursusAccess } from "@/lib/cursus";
import { extractText } from "@/lib/extract-text";
import { parseContacts } from "@/lib/parse-contacts";

const MAX_BYTES = 10 * 1024 * 1024;

// POST : extrait le texte d'un fichier (PDF, DOCX, XLSX, CSV, TXT), applique
// le parseur rules et renvoie la liste des contacts détectés.
// Le client affiche l'aperçu éditable et décide d'inviter ou non.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const { fichierNom, fichierBase64 } = await req.json() as { fichierNom?: string; fichierBase64?: string };
  if (!fichierNom || !fichierBase64) return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  if (fichierBase64.length * 0.75 > MAX_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 413 });
  }

  try {
    const texte = await extractText(fichierNom, Buffer.from(fichierBase64, "base64"));
    const contacts = parseContacts(texte);
    return NextResponse.json({ texte: texte.slice(0, 2000), contacts });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
}

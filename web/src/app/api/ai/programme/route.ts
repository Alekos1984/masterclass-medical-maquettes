import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { genererProgramme } from "@/lib/ai/programme";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { titre, description, dureeHeures, heureDebut = "08:30", objectifs, specialite } =
    await req.json() as {
      titre: string;
      description: string;
      dureeHeures: number;
      heureDebut?: string;
      objectifs: string[];
      specialite?: string;
    };

  const programme = await genererProgramme(titre, description, dureeHeures, heureDebut, objectifs, specialite);
  return NextResponse.json({ programme });
}

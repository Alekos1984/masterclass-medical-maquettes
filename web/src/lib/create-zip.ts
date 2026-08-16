// Création d'archives ZIP à la volée — via le binaire `zip` (voir Aptfile),
// même approche que extract-text.ts (pdftotext/unzip) : pas de dépendance npm.

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdir, rm, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join, dirname } from "path";

const execFileAsync = promisify(execFile);

export type ZipEntry = { path: string; content: Buffer | string };

/** Construit un ZIP en mémoire à partir d'une liste de fichiers { path, content }. */
export async function createZip(entries: ZipEntry[]): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), "zip-"));
  const zipPath = join(dir, "archive.zip");
  try {
    for (const entry of entries) {
      const filePath = join(dir, entry.path);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, entry.content);
    }
    const relativePaths = entries.map((e) => e.path);
    await execFileAsync("zip", ["-r", "-q", zipPath, ...relativePaths], { cwd: dir, maxBuffer: 64 * 1024 * 1024 });
    return await readFile(zipPath);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

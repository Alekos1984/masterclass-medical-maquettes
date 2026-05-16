import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const execFileAsync = promisify(execFile);

/**
 * Apply 128-bit PDF encryption via qpdf.
 * User password = "" (anyone can open and read).
 * Owner password = ownerPwd (required to modify or copy content).
 * Falls back to the original bytes if qpdf is not installed (dev env).
 */
export async function lockPdf(pdfBytes: Buffer, ownerPwd: string): Promise<Buffer> {
  const id = randomBytes(8).toString("hex");
  const inPath = join(tmpdir(), `pdf-in-${id}.pdf`);
  const outPath = join(tmpdir(), `pdf-out-${id}.pdf`);

  try {
    await writeFile(inPath, pdfBytes);

    await execFileAsync("qpdf", [
      "--encrypt", "", ownerPwd.slice(0, 32), "128",
      "--print=full",
      "--modify=none",
      "--copy-content=none",
      "--annotate=no",
      "--",
      inPath,
      outPath,
    ]);

    return await readFile(outPath);
  } catch {
    // qpdf not available in this environment; return unlocked PDF
    return pdfBytes;
  } finally {
    await unlink(inPath).catch(() => {});
    await unlink(outPath).catch(() => {});
  }
}

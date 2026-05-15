import { PDFDocument, PDFName } from "pdf-lib";
import crypto from "crypto";

// Suppress unused import warning — these will be used when encryption is implemented
void PDFDocument;
void PDFName;
void crypto;

/**
 * Protect a PDF with encryption/password.
 *
 * TODO: pdf-lib (v1.17.x) does not support native PDF encryption.
 * Future integration options:
 *   - node-qpdf: shell-based, wraps QPDF binary
 *   - hummus-recipe: supports RC4/AES encryption
 *   - pdfkit: supports encryption but requires rewriting the PDF from scratch
 *
 * NOTE: @react-pdf/renderer outputs PDFs that cannot easily be encrypted with pure JS
 * because the PDF structure is streamed and finalized at render time.
 * Encryption requires post-processing the fully-rendered PDF bytes.
 *
 * For now, this function is a no-op passthrough — returns the PDF bytes unchanged.
 * Implement encryption in a future phase once node-qpdf or equivalent is integrated.
 */
export async function protectPdf(pdfBytes: Uint8Array): Promise<Uint8Array> {
  // TODO: integrate node-qpdf or pdfkit for encryption
  return pdfBytes;
}

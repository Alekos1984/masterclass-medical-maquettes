import { renderToBuffer } from "@react-pdf/renderer";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderPdf(doc: any): Promise<Buffer> {
  return renderToBuffer(doc) as Promise<Buffer>;
}

export function pdfResponse(buffer: Buffer, filename: string): Response {
  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

import { createHash, randomBytes } from "node:crypto";

const STD_PAD = Buffer.from([
  0x28,0xBF,0x4E,0x5E,0x4E,0x75,0x8A,0x41,
  0x64,0x00,0x4E,0x56,0xFF,0xFA,0x01,0x08,
  0x2E,0x2E,0x00,0xB6,0xD0,0x68,0x3E,0x80,
  0x2F,0x0C,0xA9,0xFE,0x64,0x53,0x69,0x7A,
]);

function rc4(key: Buffer, data: Buffer): Buffer {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 0xFF;
    const t = s[i]; s[i] = s[j]; s[j] = t;
  }
  const out = Buffer.alloc(data.length);
  let a = 0, b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + 1) & 0xFF;
    b = (b + s[a]) & 0xFF;
    const t = s[a]; s[a] = s[b]; s[b] = t;
    out[i] = data[i] ^ s[(s[a] + s[b]) & 0xFF];
  }
  return out;
}

function md5(data: Buffer): Buffer {
  return createHash("md5").update(data).digest();
}

function padPwd(pwd: Buffer): Buffer {
  const r = Buffer.alloc(32);
  const n = Math.min(pwd.length, 32);
  pwd.copy(r, 0, 0, n);
  STD_PAD.copy(r, n, 0, 32 - n);
  return r;
}

function computeO(ownerPwd: Buffer, userPwd: Buffer): Buffer {
  let h = md5(padPwd(ownerPwd));
  for (let i = 0; i < 50; i++) h = md5(h);
  const key = h.subarray(0, 16);
  let o = rc4(key, padPwd(userPwd));
  for (let i = 1; i <= 19; i++) {
    const k = Buffer.from(key);
    for (let x = 0; x < 16; x++) k[x] ^= i;
    o = rc4(k, o);
  }
  return o;
}

function computeEncKey(userPwd: Buffer, O: Buffer, P: number, fileId: Buffer): Buffer {
  const pBuf = Buffer.alloc(4);
  pBuf.writeInt32LE(P, 0);
  let h = md5(Buffer.concat([padPwd(userPwd), O, pBuf, fileId]));
  for (let i = 0; i < 50; i++) h = md5(h);
  return h.subarray(0, 16);
}

function computeU(encKey: Buffer): Buffer {
  let u = rc4(encKey, Buffer.from(STD_PAD));
  for (let i = 1; i <= 19; i++) {
    const k = Buffer.from(encKey);
    for (let x = 0; x < 16; x++) k[x] ^= i;
    u = rc4(k, u);
  }
  return Buffer.concat([u, randomBytes(16)]);
}

function perObjKey(encKey: Buffer, n: number, g: number): Buffer {
  const extra = Buffer.from([n&0xFF,(n>>8)&0xFF,(n>>16)&0xFF,g&0xFF,(g>>8)&0xFF]);
  return md5(Buffer.concat([encKey, extra])).subarray(0, Math.min(encKey.length + 5, 16));
}

function decodeLiteral(raw: Buffer): Buffer {
  const out: number[] = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i] !== 0x5C) { out.push(raw[i++]); continue; }
    i++;
    if (i >= raw.length) break;
    const c = raw[i];
    if (c >= 0x30 && c <= 0x37) {
      let v = c - 0x30; i++;
      if (i < raw.length && raw[i] >= 0x30 && raw[i] <= 0x37) { v = v*8+(raw[i++]-0x30); }
      if (i < raw.length && raw[i] >= 0x30 && raw[i] <= 0x37) { v = v*8+(raw[i++]-0x30); }
      out.push(v & 0xFF);
    } else if (c === 0x0D) { i++; if (i < raw.length && raw[i] === 0x0A) i++; }
    else if (c === 0x0A) { i++; }
    else {
      const m: Record<number,number> = {0x6E:10,0x72:13,0x74:9,0x62:8,0x66:12,0x28:40,0x29:41,0x5C:92};
      out.push(m[c] ?? c); i++;
    }
  }
  return Buffer.from(out);
}

// Encrypt all PDF string tokens (literal and hex) in a buffer, leaving structure intact
function encryptStrings(buf: Buffer, key: Buffer): Buffer {
  const p: Buffer[] = [];
  let i = 0;
  while (i < buf.length) {
    const c = buf[i];
    if (c === 0x25) { // % comment — skip to EOL
      let j = i;
      while (j < buf.length && buf[j] !== 0x0A && buf[j] !== 0x0D) j++;
      p.push(buf.subarray(i, j)); i = j;
    } else if (c === 0x28) { // ( literal string
      let depth = 1, j = i + 1;
      while (j < buf.length && depth > 0) {
        if (buf[j] === 0x5C) j += 2;
        else if (buf[j] === 0x28) { depth++; j++; }
        else if (buf[j] === 0x29) { depth--; j++; }
        else j++;
      }
      const enc = rc4(key, decodeLiteral(buf.subarray(i+1, j-1)));
      p.push(Buffer.from("<" + enc.toString("hex").toUpperCase() + ">")); i = j;
    } else if (c === 0x3C && i+1 < buf.length && buf[i+1] === 0x3C) {
      p.push(buf.subarray(i, i+2)); i += 2; // << dict start
    } else if (c === 0x3E && i+1 < buf.length && buf[i+1] === 0x3E) {
      p.push(buf.subarray(i, i+2)); i += 2; // >> dict end
    } else if (c === 0x3C) { // < hex string
      let j = i + 1;
      while (j < buf.length && buf[j] !== 0x3E) j++;
      const hex = buf.subarray(i+1, j).toString("ascii").replace(/\s/g, "");
      const padded = hex.length % 2 ? hex + "0" : hex;
      const enc = rc4(key, Buffer.from(padded, "hex"));
      p.push(Buffer.from("<" + enc.toString("hex").toUpperCase() + ">")); i = j + 1;
    } else { p.push(buf.subarray(i, i+1)); i++; }
  }
  return Buffer.concat(p);
}

// Encrypt strings in dict portion and RC4 the stream data
function encryptBody(body: Buffer, key: Buffer): Buffer {
  // Find the "stream" keyword (preceded by whitespace or >>)
  let skw = -1;
  for (let i = 0; i <= body.length - 6; i++) {
    if (body[i]===0x73&&body[i+1]===0x74&&body[i+2]===0x72&&body[i+3]===0x65&&body[i+4]===0x61&&body[i+5]===0x6D) {
      const prev = i > 0 ? body[i-1] : 0;
      if (prev===0x0A||prev===0x0D||prev===0x20||prev===0x3E) { skw = i; break; }
    }
  }
  if (skw === -1) return encryptStrings(body, key);

  let ds = skw + 6;
  if (ds < body.length && body[ds] === 0x0D) ds++;
  if (ds < body.length && body[ds] === 0x0A) ds++;

  // Find endstream from end of body
  let ep = -1;
  for (let i = body.length - 9; i >= ds; i--) {
    if (body.subarray(i, i+9).toString("binary") === "endstream") { ep = i; break; }
  }
  if (ep === -1) return encryptStrings(body, key);

  let de = ep;
  if (de > 0 && body[de-1] === 0x0A) de--;
  if (de > 0 && body[de-1] === 0x0D) de--;

  return Buffer.concat([
    encryptStrings(body.subarray(0, skw), key),
    body.subarray(skw, ds),
    rc4(key, body.subarray(ds, de)),
    body.subarray(de),
  ]);
}

function parseXref(text: string): Map<number, number> {
  const map = new Map<number, number>();
  const sxIdx = text.lastIndexOf("startxref");
  if (sxIdx === -1) return map;
  const xrefOffset = parseInt(text.substring(sxIdx + 9).trim());
  if (isNaN(xrefOffset)) return map;
  const xref = text.substring(xrefOffset);
  if (!xref.startsWith("xref")) return map;
  const lines = xref.split(/\r?\n/);
  let i = 1;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "trailer" || line.startsWith("trailer")) break;
    const m = /^(\d+) (\d+)$/.exec(line);
    if (m) {
      const start = parseInt(m[1]), count = parseInt(m[2]);
      i++;
      for (let j = 0; j < count; j++, i++) {
        if (!lines[i]) continue;
        const parts = lines[i].trim().split(/\s+/);
        if (parts[2] === "n") map.set(start + j, parseInt(parts[0]));
      }
    } else { i++; }
  }
  return map;
}

/**
 * Encrypt a PDF with RC4-128 (PDF 1.4, V=2, R=3).
 * Random 256-bit owner password generated internally, never stored.
 * User password = "" so anyone can open and read.
 * Permissions P = -1852: print allowed, modify/copy/annotate/forms/assemble disallowed.
 */
export async function lockPdf(pdfBytes: Buffer): Promise<Buffer> {
  const P = -1852; // 0xFFFFF8C4
  const ownerPwd = randomBytes(32); // never stored, never returned
  const userPwd = Buffer.alloc(0);
  const fileId = randomBytes(16);

  const O = computeO(ownerPwd, userPwd);
  const encKey = computeEncKey(userPwd, O, P, fileId);
  const U = computeU(encKey);

  const text = pdfBytes.toString("binary");
  const xrefOffsets = parseXref(text);
  if (xrefOffsets.size === 0) return pdfBytes;

  let maxObj = 0;
  for (const n of xrefOffsets.keys()) maxObj = Math.max(maxObj, n);
  const encObjNum = maxObj + 1;

  const sortedObjs = [...xrefOffsets.entries()].sort((a, b) => a[1] - b[1]);
  const startxrefIdx = text.lastIndexOf("startxref");
  const bodyEnd = startxrefIdx !== -1 ? startxrefIdx : pdfBytes.length;

  // Preserve header (including optional binary comment line)
  let headerEnd = text.indexOf("\n") + 1;
  if (headerEnd < text.length && text[headerEnd] === "%") {
    headerEnd = text.indexOf("\n", headerEnd) + 1;
  }

  const parts: Buffer[] = [];
  parts.push(pdfBytes.subarray(0, headerEnd));
  let offset = headerEnd;

  const newOffsets = new Map<number, number>();

  for (const [objNum, objOffset] of sortedObjs) {
    // Find "N G obj" header end
    const headerMatch = /\d+ \d+ obj/.exec(text.substring(objOffset, objOffset + 30));
    if (!headerMatch) continue;
    let bodyStart = objOffset + headerMatch.index + headerMatch[0].length;
    if (bodyStart < text.length && text[bodyStart] === "\r") bodyStart++;
    if (bodyStart < text.length && text[bodyStart] === "\n") bodyStart++;

    // Search for endobj up to the next object or xref section
    const nextOffset = sortedObjs.find(([, o]) => o > objOffset)?.[1] ?? bodyEnd;
    const span = text.substring(bodyStart, Math.min(nextOffset + 50, bodyEnd + 50));
    const endobjIdx = span.lastIndexOf("endobj");
    if (endobjIdx === -1) continue;

    let bodyEndPos = bodyStart + endobjIdx;
    // Trim trailing newline before endobj
    while (bodyEndPos > bodyStart && (text[bodyEndPos-1] === "\n" || text[bodyEndPos-1] === "\r")) bodyEndPos--;

    const key = perObjKey(encKey, objNum, 0);
    const objHeaderBuf = pdfBytes.subarray(objOffset, bodyStart);
    const bodyBuf = pdfBytes.subarray(bodyStart, bodyEndPos);
    const encBodyBuf = encryptBody(bodyBuf, key);

    newOffsets.set(objNum, offset);
    const chunk = Buffer.concat([objHeaderBuf, encBodyBuf, Buffer.from("\nendobj\n")]);
    parts.push(chunk);
    offset += chunk.length;
  }

  // /Encrypt object — NOT encrypted, must not be passed through encryptBody
  const Ostr = O.toString("hex").toUpperCase();
  const Ustr = U.toString("hex").toUpperCase();
  const idStr = fileId.toString("hex").toUpperCase();
  const encObjStr = `${encObjNum} 0 obj\n<< /Filter /Standard /V 2 /R 3 /Length 128 /P ${P} /O <${Ostr}> /U <${Ustr}> >>\nendobj\n`;
  newOffsets.set(encObjNum, offset);
  const encObjBuf = Buffer.from(encObjStr, "binary");
  parts.push(encObjBuf);
  offset += encObjBuf.length;

  // Build xref table — each entry is exactly 20 bytes
  const xrefStart = offset;
  const totalObjs = encObjNum + 1;
  let xrefStr = `xref\n0 ${totalObjs}\n`;
  xrefStr += "0000000000 65535 f \n"; // object 0 (free)
  for (let n = 1; n <= encObjNum; n++) {
    const off = newOffsets.get(n);
    xrefStr += off !== undefined
      ? off.toString().padStart(10, "0") + " 00000 n \n"
      : "0000000000 65535 f \n";
  }
  parts.push(Buffer.from(xrefStr, "binary"));

  // Parse /Root and /Info from original trailer
  const trailerSection = text.substring(text.lastIndexOf("trailer"));
  const rootM = /\/Root\s+(\d+ \d+ R)/.exec(trailerSection);
  const infoM = /\/Info\s+(\d+ \d+ R)/.exec(trailerSection);
  const root = rootM ? rootM[1] : "1 0 R";
  const info = infoM ? ` /Info ${infoM[1]}` : "";

  const trailer = `trailer\n<< /Size ${totalObjs} /Root ${root}${info} /Encrypt ${encObjNum} 0 R /ID [<${idStr}> <${idStr}>] >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  parts.push(Buffer.from(trailer, "binary"));

  return Buffer.concat(parts);
}

// Génération de fichiers iCalendar (.ics) — bloqueurs d'agenda universels

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** "2026-09-14" + "09:00" → "20260914T090000" (heure locale flottante) */
function icsDateTime(dateISO: string, heure: string): string {
  const d = dateISO.slice(0, 10).replace(/-/g, "");
  const h = heure.replace(":", "").padEnd(6, "0");
  return `${d}T${h}`;
}

export function generateIcs(event: {
  uid: string;
  titre: string;
  description?: string;
  lieu?: string;
  dateISO: string; // "2026-09-14"
  heureDebut: string; // "09:00"
  heureFin: string; // "17:00"
  url?: string;
}): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Masterclass Medical//Coordination//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}@masterclassmedicale.com`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Europe/Paris:${icsDateTime(event.dateISO, event.heureDebut)}`,
    `DTEND;TZID=Europe/Paris:${icsDateTime(event.dateISO, event.heureFin)}`,
    `SUMMARY:${icsEscape(event.titre)}`,
    event.description ? `DESCRIPTION:${icsEscape(event.description)}` : null,
    event.lieu ? `LOCATION:${icsEscape(event.lieu)}` : null,
    event.url ? `URL:${event.url}` : null,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(event.titre)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function icsToBase64(ics: string): string {
  return Buffer.from(ics, "utf-8").toString("base64");
}

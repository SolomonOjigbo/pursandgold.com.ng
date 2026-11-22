import { notify } from "@/lib/mail";

/** Emails the Purs & Gold inbox about something a human must look at. Never throws. */
export async function alertOps(subject: string, detail: Record<string, unknown>) {
  try {
    const rows = Object.entries(detail)
      .map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0"><strong>${esc(k)}</strong></td><td>${esc(String(v))}</td></tr>`)
      .join("");
    await notify(`[Purs Pay] ${subject}`, `<table>${rows}</table>`);
  } catch (err) {
    console.error("alertOps failed", subject, err);
  }
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

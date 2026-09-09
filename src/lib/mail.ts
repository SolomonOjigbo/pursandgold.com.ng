import { Resend } from "resend";
import { site } from "@/content/site";

/** Sends a notification through Resend. Silently skips when RESEND_API_KEY is absent (local preview). */
export async function notify(subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_TO_EMAIL ?? site.email;
  const from = process.env.LEADS_FROM_EMAIL ?? `Purs & Gold Website <no-reply@pursandgold.com.ng>`;
  if (!key) return { skipped: true as const };
  const resend = new Resend(key);
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);
  return { skipped: false as const };
}

"use server";

import { z } from "zod";
import { getDb } from "@/lib/db";
import { leads, discoveryRequests } from "@/db/schema";
import { notify } from "@/lib/mail";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> };

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(160),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  interest: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  locale: z.enum(["en", "pt"]).default("en"),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export async function submitLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const data = parsed.data;
  if (data.website) return { ok: true, message: "Thank you. We will be in touch shortly." };

  try {
    const db = getDb();
    if (db) {
      await db.insert(leads).values({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        interest: data.interest || null,
        message: data.message || null,
        source: "website-contact",
        locale: data.locale,
      });
    }
    await notify(
      `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`,
      `<p><strong>${escapeHtml(data.name)}</strong> &lt;${escapeHtml(data.email)}&gt;${data.phone ? ` · ${escapeHtml(data.phone)}` : ""}</p>
       <p>Company: ${escapeHtml(data.company || "—")}<br/>Interest: ${escapeHtml(data.interest || "—")}<br/>Locale: ${data.locale}</p>
       <p>${escapeHtml(data.message || "").replace(/\n/g, "<br/>")}</p>`,
    );
    return {
      ok: true,
      message:
        data.locale === "pt"
          ? "Obrigado. Entraremos em contacto em breve."
          : "Thank you. We will be in touch within one business day.",
    };
  } catch (err) {
    console.error("submitLead failed", err);
    return { ok: false, message: "Something went wrong on our side. Please email info@pursandgold.com.ng or call us." };
  }
}

const discoverySchema = z.object({
  company: z.string().trim().min(2, "Company name is required.").max(200),
  contactName: z.string().trim().min(2, "Contact name is required.").max(160),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  plan: z.string().trim().max(40).optional().or(z.literal("")),
  users: z.string().trim().max(40).optional().or(z.literal("")),
  domain: z.string().trim().max(200).optional().or(z.literal("")),
  emailProvider: z.string().trim().max(60).optional().or(z.literal("")),
  goLive: z.string().trim().max(60).optional().or(z.literal("")),
  urgent: z.string().trim().max(10).optional().or(z.literal("")),
  services: z.array(z.string().max(80)).max(20).optional(),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function submitDiscovery(_prev: FormState, formData: FormData): Promise<FormState> {
  const entries: Record<string, unknown> = Object.fromEntries(formData);
  entries.services = formData.getAll("services").map(String);
  const parsed = discoverySchema.safeParse(entries);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const d = parsed.data;
  if (d.website) return { ok: true, message: "Thank you. We will schedule your discovery call shortly." };
  const { company, contactName, email, phone, website: _w, ...answers } = d;
  void _w;
  try {
    const db = getDb();
    if (db) {
      await db.insert(discoveryRequests).values({ company, contactName, email, phone: phone || null, answers });
    }
    const rows = Object.entries(answers)
      .map(([k, v]) => `<tr><td style="padding:4px 8px;color:#666">${escapeHtml(k)}</td><td style="padding:4px 8px">${escapeHtml(Array.isArray(v) ? v.join(", ") : String(v ?? ""))}</td></tr>`)
      .join("");
    await notify(
      `Discovery call request: ${company}`,
      `<p><strong>${escapeHtml(contactName)}</strong> &lt;${escapeHtml(email)}&gt;${phone ? ` · ${escapeHtml(phone)}` : ""} at <strong>${escapeHtml(company)}</strong></p><table>${rows}</table>`,
    );
    return { ok: true, message: "Thank you. We will confirm a discovery call slot within one business day." };
  } catch (err) {
    console.error("submitDiscovery failed", err);
    return { ok: false, message: "Something went wrong on our side. Please email info@pursandgold.com.ng or call us." };
  }
}

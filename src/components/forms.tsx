"use client";

import { useActionState } from "react";
import { submitLead, submitDiscovery, type FormState } from "@/app/actions/leads";
import { services } from "@/content/services";
import { industries } from "@/content/industries";

const initial: FormState = { ok: false, message: "" };

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  placeholder,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="text-gold-ink"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gold"
      />
      {error ? <span className="mt-1 block text-xs text-[#b5432f]">{error}</span> : null}
    </label>
  );
}

function Status({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={`rounded-md px-4 py-3 text-sm ${state.ok ? "bg-[#e4f1e8] text-ok" : "bg-[#f8e5e0] text-[#b5432f]"}`}>
      {state.message}
    </p>
  );
}

export function LeadForm({ locale = "en", interest }: { locale?: "en" | "pt"; interest?: string }) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const pt = locale === "pt";
  if (state.ok) return <Status state={state} />;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={pt ? "Nome" : "Name"} name="name" required autoComplete="name" error={state.errors?.name} />
        <Field label="Email" name="email" type="email" required autoComplete="email" error={state.errors?.email} />
        <Field label={pt ? "Telefone / WhatsApp" : "Phone / WhatsApp"} name="phone" type="tel" autoComplete="tel" error={state.errors?.phone} />
        <Field label={pt ? "Empresa" : "Company"} name="company" autoComplete="organization" error={state.errors?.company} />
      </div>
      <label className="block">
        <span className="text-sm font-medium">{pt ? "Interesse" : "What are you interested in?"}</span>
        <select
          name="interest"
          defaultValue={interest ?? ""}
          className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
        >
          <option value="">{pt ? "Selecione" : "Select a service"}</option>
          {services.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name}
            </option>
          ))}
          <option value="Software product">{pt ? "Produto de software" : "A software product"}</option>
          <option value="Other">{pt ? "Outro" : "Something else"}</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium">{pt ? "Mensagem" : "Message"}</span>
        <textarea
          name="message"
          rows={4}
          className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
          placeholder={pt ? "Conte-nos sobre o seu negócio e o que precisa." : "Tell us about your business and what you need."}
        />
      </label>
      <Status state={state} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-2 disabled:opacity-60"
      >
        {pending ? (pt ? "A enviar…" : "Sending…") : pt ? "Enviar mensagem" : "Send message"}
      </button>
    </form>
  );
}

export function DiscoveryForm({ plan }: { plan?: string }) {
  const [state, action, pending] = useActionState(submitDiscovery, initial);
  if (state.ok) return <Status state={state} />;
  const section = (title: string, text?: string) => (
    <div className="border-t border-line pt-6">
      <h3 className="text-lg font-bold">{title}</h3>
      {text ? <p className="mt-1 text-sm text-text-2">{text}</p> : null}
    </div>
  );
  return (
    <form action={action} className="space-y-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input type="hidden" name="plan" value={plan ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" name="company" required autoComplete="organization" error={state.errors?.company} />
        <label className="block">
          <span className="text-sm font-medium">Industry</span>
          <select name="industry" className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
            <option value="">Select</option>
            {industries.map((i) => (
              <option key={i.slug} value={i.name}>
                {i.name}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </label>
        <Field label="Primary contact" name="contactName" required autoComplete="name" error={state.errors?.contactName} />
        <Field label="Email" name="email" type="email" required autoComplete="email" error={state.errors?.email} />
        <Field label="Phone / WhatsApp" name="phone" type="tel" autoComplete="tel" />
        <Field label="Total number of staff or email users" name="users" placeholder="e.g. 12" />
      </div>

      {section("Domain and email", "So we can classify the migration before the call.")}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Domain name" name="domain" placeholder="company.com" />
        <label className="block">
          <span className="text-sm font-medium">Current email provider</span>
          <select name="emailProvider" className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
            {["", "cPanel hosting", "Google Workspace", "Microsoft 365", "Zoho Mail", "Free webmail", "Other"].map((o) => (
              <option key={o} value={o}>
                {o || "Select"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {section("What you need", "Tick everything that applies. We bundle where it saves you money.")}
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          "Website redesign or new website",
          "Digital Growth Engine subscription",
          "ERP, inventory or POS system",
          "CRM and sales automation",
          "Cloud productivity migration (Google / Microsoft / Zoho)",
          "Managed IT support retainer",
          "Digital marketing and social media",
          "Branding and creative",
          "ParishHub, School ERP or another software product",
          "Mobile app",
        ].map((s) => (
          <label key={s} className="flex items-start gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm">
            <input type="checkbox" name="services" value={s} className="mt-0.5 accent-[#d4a017]" />
            <span>{s}</span>
          </label>
        ))}
      </div>

      {section("Timeline")}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Desired go-live date" name="goLive" type="date" />
        <label className="block">
          <span className="text-sm font-medium">Is this urgent?</span>
          <select name="urgent" className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Anything else we should know?</span>
        <textarea name="notes" rows={4} className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
      </label>
      <Status state={state} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-2 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request my discovery call"}
      </button>
      <p className="text-xs text-muted">
        We use your details only to prepare and follow up on your discovery call, in line with the Nigeria Data Protection Act 2023.
      </p>
    </form>
  );
}

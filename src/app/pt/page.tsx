import type { Metadata } from "next";
import { site } from "@/content/site";
import { usdItems } from "@/lib/catalog";
import { Container, Section, SectionHeading, Button, Check } from "@/components/ui";
import { LeadForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Soluções Digitais. Crescimento Real.",
  description: "Websites, marketing digital, e-mail profissional, sistemas de gestão e suporte de TI para empresas em Cabo Verde e países lusófonos. Preços em dólares.",
  alternates: { canonical: "/pt", languages: { en: "/", pt: "/pt" } },
  openGraph: { locale: "pt_CV" },
};

const linhas = [
  { t: "Desenvolvimento Web & Mobile", d: "Sites corporativos e de e-commerce, portais, aplicações web e apps iOS e Android, com integração de IA e automação." },
  { t: "Marketing Digital", d: "Gestão de redes sociais, anúncios pagos, SEO, e-mail marketing e relatórios mensais com métricas claras." },
  { t: "E-mail Profissional & Produtividade", d: "Google Workspace, Microsoft 365 ou Zoho, servidores de e-mail VPS com SPF, DKIM e DMARC, e e-mail marketing em massa." },
  { t: "Gestão de Registos & Contabilidade", d: "Sistemas de registos e finanças para igrejas, escolas, clínicas, ONGs e instituições, com acesso por perfis e auditoria." },
  { t: "Ponto de Venda & Stock", d: "Pursberry: POS offline, stock em tempo real em várias lojas, fornecedores e contabilidade integrada." },
];

export default function PtPage() {
  const groups: Record<string, ReturnType<typeof usdItems>> = {};
  for (const item of usdItems()) {
    const key = (item.Code ?? "").split("-")[0].replace(/\s.*$/, "");
    (groups[key] ??= []).push(item);
  }
  const labels: Record<string, string> = {
    DGE: "Motor de Crescimento Digital (mensal)",
    WEB: "Websites e aplicações",
    RMS: "Registos e contabilidade",
    CLD: "Nuvem e migração",
    EML: "E-mail e produtividade",
    POS: "Ponto de venda e stock",
    PB: "Subscrição Pursberry",
    RET: "Suporte de TI gerido (mensal)",
  };
  return (
    <div lang="pt">
      <section className="grid-bg relative overflow-hidden bg-ink text-paper">
        <div className="glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative py-20 sm:py-28">
          <p className="eyebrow text-gold-2">Purs &amp; Gold Limited · Cabo Verde e mercados lusófonos</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.02] sm:text-6xl">
            Soluções Digitais. <span className="text-gold-2">Crescimento Real.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/80">
            Um único parceiro para o seu website, e-mail, marketing, sistemas e suporte de TI. Preços em dólares, faturação
            mensal, sem compromisso anual obrigatório.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#contacto">Fale connosco</Button>
            <Button href={site.whatsappPt} variant="outline">
              WhatsApp {site.phones.lusophone.display}
            </Button>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Serviços" title="Tudo o que o seu negócio precisa para crescer online" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {linhas.map((l) => (
              <div key={l.t} className="rounded-xl border border-line bg-paper p-6">
                <h2 className="text-lg font-bold">{l.t}</h2>
                <p className="mt-2 text-sm text-text-2">{l.d}</p>
              </div>
            ))}
            <div className="rounded-xl border border-gold bg-gold-soft p-6">
              <h2 className="text-lg font-bold">Porquê a Purs &amp; Gold?</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {["Equipa especializada em África", "Segurança empresarial incluída (MFA, cópias de segurança, SPF e DKIM)", "Um parceiro, uma fatura, resultados mensuráveis", "Atendimento em português"].map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="paper-2" id="precos">
        <Container>
          <SectionHeading eyebrow="Preços" title="Lista de preços em dólares americanos" text="Valores sem impostos. Montantes em escudos cabo-verdianos são apresentados nas faturas apenas como conversão indicativa. Serviços não listados são orçamentados conforme as necessidades do cliente." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {Object.entries(groups).map(([key, items]) => (
              <div key={key} className="rounded-xl border border-line bg-paper">
                <p className="eyebrow border-b border-line px-5 py-3 text-gold-ink">{labels[key] ?? key}</p>
                <ul className="divide-y divide-line text-sm">
                  {items.map((i) => (
                    <li key={i.Code} className="flex items-start justify-between gap-4 px-5 py-3">
                      <span className="text-text-2">{i.Item}</span>
                      <span className="whitespace-nowrap text-right font-semibold">{i.USD}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-text-2">Subscrições pagas 12 meses adiantados recebem 10% de desconto nas mensalidades, opcionalmente.</p>
        </Container>
      </Section>

      <Section id="contacto">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="Contacto" title="Vamos construir o seu próximo sucesso digital." text="Responda em português. Respondemos em um dia útil." />
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="eyebrow text-muted">WhatsApp</dt>
                <dd className="mt-1">
                  <a href={site.whatsappPt} className="font-semibold text-gold-ink hover:underline">
                    {site.phones.lusophone.display}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-muted">Telefone</dt>
                <dd className="mt-1">
                  <a href={`tel:${site.phones.primary.tel}`} className="hover:text-gold-ink">
                    {site.phones.primary.display}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-muted">E-mail</dt>
                <dd className="mt-1">
                  <a href={`mailto:${site.email}`} className="hover:text-gold-ink">
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-line bg-paper-2 p-6 sm:p-8">
            <LeadForm locale="pt" />
          </div>
        </Container>
      </Section>
    </div>
  );
}

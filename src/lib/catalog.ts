import raw from "@/generated/catalog.json";

export type CatalogItem = Record<string, string | null> & {
  status: "Confirmed" | "Proposed" | "Decision" | "Retire" | null;
  note: string | null;
};
export type TableBlock = { type: "table"; columns: string[]; items: CatalogItem[] };
export type TextBlock = { type: "text"; text: string };
export type Block = TableBlock | TextBlock;
export type Subsection = { id: string | null; title: string; blocks: Block[] };
export type Section = { id: string; title: string; blocks: Block[]; subsections: Subsection[] };
export type Catalog = { version: string | null; generatedAt: string; sections: Section[] };

export const catalog = raw as unknown as Catalog;

/** Only Confirmed rows are public. Proposed, Decision and Retire rows stay internal. */
export function publicItems(block: TableBlock): CatalogItem[] {
  return block.items.filter((i) => i.status === "Confirmed");
}

export function section(id: string): Section | undefined {
  return catalog.sections.find((s) => s.id === id);
}

export function subsection(sectionId: string, subId: string): Subsection | undefined {
  return section(sectionId)?.subsections.find((s) => s.id === subId);
}

export function tables(container: { blocks: Block[] }): TableBlock[] {
  return container.blocks.filter((b): b is TableBlock => b.type === "table");
}

export function texts(container: { blocks: Block[] }): string[] {
  return container.blocks.filter((b): b is TextBlock => b.type === "text").map((b) => b.text);
}

export function findByCode(code: string): CatalogItem | undefined {
  for (const s of catalog.sections) {
    for (const t of [...tables(s), ...s.subsections.flatMap(tables)]) {
      const hit = t.items.find((i) => i.Code === code);
      if (hit) return hit;
    }
  }
  return undefined;
}

/** Digital Growth Engine plans: the first table in section A. */
export type Plan = {
  code: string;
  name: string;
  monthly: string;
  onboarding: string;
  prepay: string;
  recommended: boolean;
  inclusions: { label: string; value: string }[];
};

export function growthPlans(): Plan[] {
  const a = section("A");
  if (!a) return [];
  const planTable = tables(a)[0];
  const inclusionTable = a.subsections.find((s) => s.title.startsWith("What each plan"))?.blocks.find(
    (b): b is TableBlock => b.type === "table",
  );
  return publicItems(planTable).map((row) => {
    const name = (row.Plan ?? "").replace(/\s*\(.*\)$/, "");
    const column = inclusionTable?.columns.find((c) => name.toLowerCase().startsWith(c.toLowerCase())) ?? name;
    const inclusions =
      inclusionTable?.items.map((i) => ({ label: i.Inclusion ?? "", value: i[column] ?? "" })).filter((x) => x.value && x.value !== "No") ?? [];
    return {
      code: row.Code ?? "",
      name,
      monthly: row["Monthly fee"] ?? "",
      onboarding: row["Onboarding fee"] ?? "",
      prepay: row["Optional 12-month prepay (10% off fees)"] ?? "",
      recommended: /recommended/i.test(row.Plan ?? ""),
      inclusions,
    };
  });
}

/** Lusophone (USD) list, section I. */
export function usdItems(): CatalogItem[] {
  const i = section("I");
  if (!i) return [];
  return tables(i).flatMap(publicItems);
}

/** SLA table from E4. */
export function slaRows(): CatalogItem[] {
  const e4 = subsection("E", "E4");
  return e4 ? tables(e4).flatMap((t) => t.items) : [];
}

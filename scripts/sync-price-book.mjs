// Parses content/price-book.md (the master Services & Product Catalog) into src/generated/catalog.json.
// The website never carries its own copy of a price: edit the markdown, run `pnpm sync:catalog`.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SRC = new URL("../content/price-book.md", import.meta.url);
const OUT = new URL("../src/generated/catalog.json", import.meta.url);

const md = readFileSync(SRC, "utf8");
const lines = md.split("\n");

const STATUS_RE = /\*\*(Confirmed|Proposed|Decision|Retire)\*\*(?:\s*\(([^)]*)\))?/;

function stripMd(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function parseStatus(cell) {
  const m = cell.match(STATUS_RE);
  if (!m) return { status: null, note: null };
  return { status: m[1], note: m[2] ? m[2].trim() : null };
}

const catalog = { version: null, generatedAt: new Date().toISOString(), sections: [] };
let section = null;
let sub = null;
let i = 0;

const metaLine = lines.find((l) => l.startsWith("**Purs & Gold Limited ·"));
if (metaLine) catalog.version = stripMd(metaLine);

function pushBlock(target, block) {
  if (!target) return;
  target.blocks.push(block);
}

while (i < lines.length) {
  const raw = lines[i];
  const s = raw.trim();
  if (/^## [A-Z]\. /.test(s)) {
    const [, letter, title] = s.match(/^## ([A-Z])\. (.*)$/);
    section = { id: letter, title: title.trim(), blocks: [], subsections: [] };
    sub = null;
    catalog.sections.push(section);
    i++;
    continue;
  }
  if (/^### /.test(s) && section) {
    const m = s.match(/^### ([A-Z]\d+\.)?\s*(.*)$/);
    sub = { id: m[1] ? m[1].replace(".", "") : null, title: m[2].trim(), blocks: [] };
    section.subsections.push(sub);
    i++;
    continue;
  }
  if (s.startsWith("|") && section) {
    const rows = [];
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      rows.push(lines[i].trim());
      i++;
    }
    const cells = rows.map((r) => r.slice(1, -1).split("|").map((c) => c.trim()));
    const header = cells[0].map(stripMd);
    const body = cells.slice(2);
    const items = body.map((r) => {
      const obj = {};
      let status = null, note = null;
      header.forEach((h, idx) => {
        const c = r[idx] ?? "";
        if (h === "Status") {
          ({ status, note } = parseStatus(c));
        } else {
          obj[h] = stripMd(c);
        }
      });
      return { ...obj, status, note };
    });
    pushBlock(sub ?? section, { type: "table", columns: header.filter((h) => h !== "Status"), items });
    continue;
  }
  if (s && !s.startsWith("#") && section) {
    const paras = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("|") && !lines[i].trim().startsWith("#")) {
      paras.push(lines[i].trim());
      i++;
    }
    const text = stripMd(paras.join(" ")).replace(STATUS_RE, "").trim();
    pushBlock(sub ?? section, { type: "text", text });
    continue;
  }
  i++;
}

mkdirSync(dirname(OUT.pathname), { recursive: true });
writeFileSync(OUT, JSON.stringify(catalog, null, 2));
const tables = catalog.sections.flatMap((s) => [...s.blocks, ...s.subsections.flatMap((x) => x.blocks)]).filter((b) => b.type === "table");
const items = tables.flatMap((t) => t.items);
console.log(`sections ${catalog.sections.length}, tables ${tables.length}, items ${items.length}, confirmed ${items.filter((x) => x.status === "Confirmed").length}`);

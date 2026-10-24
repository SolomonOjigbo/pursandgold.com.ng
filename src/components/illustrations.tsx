import type { Product } from "@/content/products";

/**
 * Product illustrations: a small "app window" scene drawn per product, in the product's accent.
 * No raster assets, so cards stay crisp at any size and in both themes.
 */
const palettes: Record<Product["accent"], { bg1: string; bg2: string; panel: string; ink: string; line: string; hi: string }> = {
  gold: { bg1: "#2b2005", bg2: "#8a6410", panel: "#fbf7ee", ink: "#171a21", line: "#e6dcc2", hi: "#d4a017" },
  rose: { bg1: "#33101b", bg2: "#a13650", panel: "#fff6f8", ink: "#2a1218", line: "#f0d6dc", hi: "#c8425f" },
  navy: { bg1: "#0c172c", bg2: "#2f5aa8", panel: "#f3f6fc", ink: "#101a2e", line: "#d6dfef", hi: "#3b6fc4" },
  teal: { bg1: "#0a2523", bg2: "#1f8a80", panel: "#f1faf9", ink: "#0d2624", line: "#cfe9e6", hi: "#2aa198" },
  moss: { bg1: "#0f2210", bg2: "#4a8a34", panel: "#f3faf0", ink: "#12260f", line: "#d5ead0", hi: "#5a9a3c" },
  violet: { bg1: "#1d1233", bg2: "#6c4fb3", panel: "#f6f3fd", ink: "#1e1433", line: "#e0d8f2", hi: "#7c5cc4" },
};

type Scene = "members" | "pos" | "map" | "timetable" | "units" | "roster";

function Window({ p, children }: { p: (typeof palettes)[Product["accent"]]; children: React.ReactNode }) {
  return (
    <g>
      <rect x="32" y="26" width="176" height="118" rx="8" fill={p.panel} />
      <rect x="32" y="26" width="176" height="16" rx="8" fill={p.line} />
      <rect x="32" y="34" width="176" height="8" fill={p.line} />
      <circle cx="42" cy="34" r="2.4" fill={p.hi} />
      <circle cx="50" cy="34" r="2.4" fill={p.ink} opacity=".35" />
      <circle cx="58" cy="34" r="2.4" fill={p.ink} opacity=".2" />
      {children}
    </g>
  );
}

function SceneMembers({ p }: { p: (typeof palettes)["gold"] }) {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(44 ${54 + i * 20})`}>
          <circle cx="7" cy="7" r="7" fill={i === 1 ? p.hi : p.line} />
          <rect x="20" y="3" width={52 - i * 6} height="4" rx="2" fill={p.ink} opacity=".7" />
          <rect x="20" y="10" width="34" height="3" rx="1.5" fill={p.ink} opacity=".25" />
        </g>
      ))}
      <g transform="translate(140 52)">
        <rect x="0" y="0" width="56" height="78" rx="6" fill={p.line} opacity=".7" />
        <path d="M28 12v10M23 17h10" stroke={p.hi} strokeWidth="3" strokeLinecap="round" />
        <path d="M10 66V44l18-14 18 14v22z" fill={p.hi} opacity=".9" />
        <rect x="24" y="52" width="8" height="14" rx="1" fill={p.panel} />
      </g>
    </>
  );
}

function ScenePos({ p }: { p: (typeof palettes)["gold"] }) {
  const bars = [30, 46, 38, 60, 52, 72, 66];
  return (
    <>
      {bars.map((h, i) => (
        <rect key={i} x={44 + i * 14} y={130 - h} width="9" height={h} rx="2" fill={i === bars.length - 1 ? p.hi : p.ink} opacity={i === bars.length - 1 ? 1 : 0.25} />
      ))}
      <g transform="translate(150 50)">
        <path d="M0 0h44v72l-6-4-5 4-5-4-6 4-5-4-6 4-5-4-6 4z" fill={p.panel} stroke={p.line} strokeWidth="2" />
        {[10, 20, 30].map((y) => (
          <rect key={y} x="7" y={y} width="30" height="3" rx="1.5" fill={p.ink} opacity=".35" />
        ))}
        <rect x="7" y="44" width="30" height="5" rx="2" fill={p.hi} />
      </g>
    </>
  );
}

function SceneMap({ p }: { p: (typeof palettes)["gold"] }) {
  return (
    <>
      <path d="M46 120 C 80 110, 90 60, 120 70 S 170 110, 196 62" stroke={p.ink} strokeWidth="2" strokeDasharray="4 4" fill="none" opacity=".4" />
      <circle cx="120" cy="70" r="22" fill={p.hi} opacity=".12" />
      <circle cx="120" cy="70" r="22" stroke={p.hi} strokeWidth="1.5" fill="none" opacity=".6" />
      {[
        [46, 120],
        [120, 70],
        [196, 62],
        [160, 96],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 -14a8 8 0 0 1 8 8c0 6-8 14-8 14s-8-8-8-14a8 8 0 0 1 8-8z" fill={i === 1 ? p.hi : p.ink} opacity={i === 1 ? 1 : 0.7} />
          <circle cx="0" cy="-6" r="3" fill={p.panel} />
        </g>
      ))}
    </>
  );
}

function SceneTimetable({ p }: { p: (typeof palettes)["gold"] }) {
  const lit = new Set([1, 4, 7, 10, 13, 16]);
  return (
    <>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={44 + (i % 5) * 26} y={52 + Math.floor(i / 5) * 20} width="22" height="16" rx="3" fill={lit.has(i) ? p.hi : p.line} opacity={lit.has(i) ? 0.95 : 1} />
      ))}
      <g transform="translate(176 48)">
        <path d="M14 0l14 7-14 7L0 7z" fill={p.ink} opacity=".8" />
        <path d="M6 10v7c0 3 4 5 8 5s8-2 8-5v-7" stroke={p.ink} strokeWidth="2.5" fill="none" opacity=".8" />
      </g>
    </>
  );
}

function SceneUnits({ p }: { p: (typeof palettes)["gold"] }) {
  return (
    <>
      <g transform="translate(44 52)">
        <path d="M0 78V14L26 2l26 12v64z" fill={p.line} />
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={11 + c * 20}
              y={20 + r * 17}
              width="12"
              height="11"
              rx="2"
              fill={(r + c) % 2 ? p.hi : p.ink}
              opacity={(r + c) % 2 ? 0.9 : 0.25}
            />
          )),
        )}
        <rect x="21" y="66" width="10" height="12" rx="2" fill={p.panel} />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(110 ${54 + i * 20})`}>
          <rect x="0" y="1" width={44 - i * 5} height="4" rx="2" fill={p.ink} opacity=".65" />
          <rect x="0" y="9" width="28" height="3" rx="1.5" fill={p.ink} opacity=".25" />
          <rect x="64" y="0" width="22" height="13" rx="4" fill={i === 1 ? p.line : p.hi} opacity={i === 1 ? 1 : 0.9} />
        </g>
      ))}
    </>
  );
}

function SceneRoster({ p }: { p: (typeof palettes)["gold"] }) {
  return (
    <>
      {[0, 1, 2, 3].map((r) => (
        <g key={r} transform={`translate(44 ${52 + r * 20})`}>
          <circle cx="6" cy="7" r="6" fill={p.line} />
          {[0, 1, 2, 3, 4].map((c) => {
            const on = (r * 3 + c) % 4 !== 0;
            return <rect key={c} x={20 + c * 24} y="2" width="18" height="10" rx="3" fill={on ? p.hi : p.line} opacity={on ? (c % 2 ? 0.55 : 0.95) : 1} />;
          })}
        </g>
      ))}
      <path d="M180 56c-6-8-18-4-18 5 0 8 18 18 18 18s18-10 18-18c0-9-12-13-18-5z" fill={p.hi} />
    </>
  );
}

const sceneFor: Record<string, Scene> = {
  parishhub: "members",
  pursberry: "pos",
  veritory: "map",
  "school-erp": "timetable",
  tenaville: "units",
  goodheart: "roster",
};

export function ProductIllustration({ product, className = "" }: { product: Product; className?: string }) {
  const p = palettes[product.accent];
  const scene = sceneFor[product.slug] ?? "members";
  const id = `pi-${product.slug}`;
  return (
    <svg viewBox="0 0 240 160" className={className} role="img" aria-label={`${product.name} illustration`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg1} />
          <stop offset="1" stopColor={p.bg2} />
        </linearGradient>
      </defs>
      <rect width="240" height="160" rx="14" fill={`url(#${id})`} />
      <circle cx="210" cy="24" r="60" fill={p.hi} opacity=".12" />
      <Window p={p}>
        {scene === "members" && <SceneMembers p={p} />}
        {scene === "pos" && <ScenePos p={p} />}
        {scene === "map" && <SceneMap p={p} />}
        {scene === "timetable" && <SceneTimetable p={p} />}
        {scene === "units" && <SceneUnits p={p} />}
        {scene === "roster" && <SceneRoster p={p} />}
      </Window>
    </svg>
  );
}


/** The integration map from the SOP: email at the centre, every system linked to it and to each other. */
export function SystemMap({ className = "" }: { className?: string }) {
  const nodes = [
    { id: "email", label: "Email", x: 160, y: 90, hub: true },
    { id: "erp", label: "ERP", x: 60, y: 40 },
    { id: "crm", label: "CRM", x: 260, y: 40 },
    { id: "pos", label: "POS", x: 60, y: 140 },
    { id: "mkt", label: "Marketing", x: 260, y: 140 },
    { id: "fin", label: "Finance", x: 160, y: 168 },
  ];
  const links: [string, string][] = [
    ["email", "erp"], ["email", "crm"], ["email", "pos"], ["email", "mkt"], ["email", "fin"],
    ["erp", "crm"], ["crm", "mkt"], ["pos", "erp"], ["erp", "fin"],
  ];
  const at = (id: string) => nodes.find((n) => n.id === id)!;
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Integration map: email, ERP, CRM, POS, marketing and finance connected">
      {links.map(([a, b]) => {
        const A = at(a), B = at(b);
        const hub = a === "email";
        return <line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="currentColor" strokeWidth={hub ? 1.5 : 1} strokeDasharray={hub ? undefined : "3 4"} opacity={hub ? 0.45 : 0.3} />;
      })}
      {nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
          <rect x={n.hub ? -34 : -30} y={n.hub ? -16 : -13} width={n.hub ? 68 : 60} height={n.hub ? 32 : 26} rx="8" fill={n.hub ? "#d4a017" : "currentColor"} opacity={n.hub ? 1 : 0.08} />
          <rect x={n.hub ? -34 : -30} y={n.hub ? -16 : -13} width={n.hub ? 68 : 60} height={n.hub ? 32 : 26} rx="8" fill="none" stroke={n.hub ? "#d4a017" : "currentColor"} strokeWidth="1" opacity={n.hub ? 1 : 0.35} />
          <text x="0" y="4" textAnchor="middle" fontSize={n.hub ? 12 : 11} fontWeight={n.hub ? 700 : 600} fill={n.hub ? "#0e1116" : "currentColor"} fontFamily="inherit">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

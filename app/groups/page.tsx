"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Search, Filter, MapPin, X, LayoutList, Map } from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────── */
type Scope = "National" | "State" | "Local";
type Focus = "Legal" | "Organizing" | "Research" | "Policy" | "Tools";
type ViewMode = "list" | "map";

interface Group {
  id: string;
  name: string;
  scope: Scope;
  focus: Focus[];
  location: string;
  lat?: number;
  lng?: number;
  description: string;
  url: string;
  win?: string;
}

/* ─── Group data ──────────────────────────────────────────────── */
const GROUPS: Group[] = [
  {
    id: "eff",
    name: "Electronic Frontier Foundation (EFF)",
    scope: "National",
    focus: ["Legal", "Research", "Policy"],
    location: "National",
    description:
      "Led the most comprehensive investigations into Flock Safety's surveillance abuses in 2025 — exposing protest tracking, discriminatory policing, and reproductive-rights threats. Defended DeFlock.me from Flock's cease-and-desist. Filed a landmark lawsuit against San Jose PD over warrantless ALPR searches.",
    url: "https://www.eff.org/issues/license-plates",
    win: "Sparked state and federal investigations; co-filed ACLU lawsuit against San Jose",
  },
  {
    id: "aclu",
    name: "ACLU",
    scope: "National",
    focus: ["Legal", "Policy"],
    location: "National",
    description:
      "National and state chapters have fought Flock contracts in court and in city councils across the country. The ACLU of Massachusetts helped Cambridge residents force a unanimous council pause. The ACLU of Oregon backed the Eyes Off Eugene lawsuit demanding camera location records.",
    url: "https://www.aclu.org/issues/privacy-technology/surveillance-technologies/license-plate-readers",
    win: "Supported unanimous Cambridge council pause; Oregon chapter backed Eugene records lawsuit",
  },
  {
    id: "fftf",
    name: "Fight for the Future",
    scope: "National",
    focus: ["Organizing", "Policy"],
    location: "National",
    description:
      "Runs the FLOCKOut campaign — a national petition and action hub pushing lawmakers to reject ALPR contracts. Provides toolkits for local organizers including sample legislation, talking points, and city council playbooks.",
    url: "https://www.fightforthefuture.org/actions/flockout/",
    win: "National petition; coordinated campaigns in multiple cities",
  },
  {
    id: "deflock",
    name: "DeFlock / deflock.me",
    scope: "National",
    focus: ["Tools", "Research"],
    location: "National",
    description:
      "Created by Colorado developer Will Freeman, DeFlock has mapped over 90,000 Flock camera locations across the US. When Flock Safety tried to shut it down with a trademark cease-and-desist, EFF stepped in to defend it. The map is the single most important public resource for understanding the scope of Flock's network.",
    url: "https://deflock.me",
    win: "Mapped 90,000+ cameras; defeated Flock's C&D with EFF backing",
  },
  {
    id: "haveibeenflocked",
    name: "Have I Been Flocked",
    scope: "National",
    focus: ["Tools"],
    location: "National",
    description:
      "A free tool that lets you check whether your license plate appears in Flock Safety's database. Essential for anyone who wants to understand their own surveillance exposure.",
    url: "https://haveibeenflocked.com",
  },
  {
    id: "alprwatch",
    name: "ALPR.watch",
    scope: "National",
    focus: ["Tools", "Organizing"],
    location: "National",
    description:
      "Automatically scans city council meeting agendas across the country for keywords like 'Flock,' 'ALPR,' and 'license plate reader' — then puts them on a map so local residents can show up and be heard before contracts get signed.",
    url: "https://alpr.watch",
  },
  {
    id: "eyes-off-eugene",
    name: "Eyes Off Eugene",
    scope: "Local",
    focus: ["Organizing", "Legal"],
    location: "Eugene, OR",
    lat: 44.0521,
    lng: -123.0868,
    description:
      "Grassroots group that spent months organizing residents, filing public records requests, and attending city council meetings. Their sustained campaign — including backing an ACLU-supported lawsuit for camera location records — ultimately forced Eugene and Springfield, Oregon to terminate their Flock contracts entirely in December 2025.",
    url: "https://oregoncapitalchronicle.com/2025/10/23/alleging-secrecy-aclu-and-eugene-resident-sue-city-for-flock-camera-records/",
    win: "Eugene + Springfield both terminated Flock contracts (Dec 2025)",
  },
  {
    id: "trust-coalition",
    name: "TRUST Coalition",
    scope: "Local",
    focus: ["Organizing", "Policy"],
    location: "San Diego, CA",
    lat: 32.7157,
    lng: -117.1611,
    description:
      "A grassroots alliance including EFF Alliance members Tech Workers Coalition San Diego and techLEAD, campaigning against San Diego's ALPR program. Built on years of organizing against the city's earlier 'smart streetlight' surveillance program.",
    url: "https://www.eff.org/deeplinks/2025/06/san-diegans-push-back-flock-alpr-surveillance",
  },
  {
    id: "flock-off-ithaca",
    name: "Flock Off Ithaca",
    scope: "Local",
    focus: ["Organizing"],
    location: "Ithaca, NY",
    lat: 42.4440,
    lng: -76.5021,
    description:
      "Founded in summer 2024 after Ithaca installed 22 Flock cameras. Now fighting to remove 50+ cameras across Tompkins County. Active city council presence with growing community support.",
    url: "https://newrepublic.com/article/206992/flock-safety-cameras-alpr-deflock-resistance-nationwide",
  },
  {
    id: "deflock-bcs",
    name: "DropFlock BCS",
    scope: "Local",
    focus: ["Organizing", "Research"],
    location: "Bryan, TX",
    lat: 30.6744,
    lng: -96.3698,
    description:
      "Local advocacy group tracking and opposing Flock Safety deployment in the Bryan-College Station area. Publishes research and local organizing resources.",
    url: "https://www.deflockbcs.com",
  },
  {
    id: "digital-fourth",
    name: "Digital Fourth",
    scope: "Local",
    focus: ["Policy", "Organizing"],
    location: "Cambridge, MA",
    lat: 42.3736,
    lng: -71.1097,
    description:
      "Local digital rights group that worked alongside the ACLU of Massachusetts to raise Cambridge residents' concerns about Flock cameras installed without proper authorization. Their advocacy contributed to the unanimous city council vote to pause the program.",
    url: "https://www.eff.org/deeplinks/2025/12/local-communities-are-winning-against-alpr-surveillance-heres-how-2025-review",
    win: "Cambridge city council unanimous pause vote (Oct 2025)",
  },
];

const ALL_SCOPES: Scope[] = ["National", "State", "Local"];
const ALL_FOCUS: Focus[] = ["Legal", "Organizing", "Research", "Policy", "Tools"];

/* ─── SVG Map ─────────────────────────────────────────────────── */
const US_BOUNDS = { minLat: 24, maxLat: 50, minLng: -125, maxLng: -66 };

function toSvgCoords(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - US_BOUNDS.minLng) / (US_BOUNDS.maxLng - US_BOUNDS.minLng)) * w;
  const y = (1 - (lat - US_BOUNDS.minLat) / (US_BOUNDS.maxLat - US_BOUNDS.minLat)) * h;
  return { x, y };
}

function GroupMap({
  groups,
  allGroups,
  selectedId,
  onSelect,
}: {
  groups: Group[];
  allGroups: Group[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const W = 900;
  const H = 520;
  // All pinnable groups (for faint background dots)
  const allPinnable = allGroups.filter((g) => g.lat && g.lng);
  // Filtered pinnable groups (bright)
  const filteredPinnable = groups.filter((g) => g.lat && g.lng);
  const filteredIds = new Set(filteredPinnable.map((g) => g.id));

  const selected = allGroups.find((g) => g.id === selectedId) ?? null;

  return (
    <div className="flex h-full min-h-0">
      {/* SVG map */}
      <div className="flex-1 relative bg-[#1A1A1A]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ display: "block" }}>
          {/* Background */}
          <rect width={W} height={H} fill="#1A1A1A" />

          {/* Subtle grid */}
          {[0.2, 0.4, 0.6, 0.8].map((f) => (
            <g key={f}>
              <line x1={f * W} y1={0} x2={f * W} y2={H} stroke="#F2EDE4" strokeWidth={0.4} opacity={0.05} />
              <line x1={0} y1={f * H} x2={W} y2={f * H} stroke="#F2EDE4" strokeWidth={0.4} opacity={0.05} />
            </g>
          ))}

          {/* Watermark */}
          <text x={W / 2} y={H / 2 + 30} textAnchor="middle" fill="#F2EDE4" opacity={0.03}
            fontSize={130} fontFamily="monospace" fontWeight="bold" letterSpacing={8}>
            USA
          </text>

          {/* Dim dots for groups not in filter */}
          {allPinnable.filter((g) => !filteredIds.has(g.id)).map((g) => {
            const { x, y } = toSvgCoords(g.lat!, g.lng!, W, H);
            return (
              <circle key={g.id} cx={x} cy={y} r={4} fill="#F2EDE4" opacity={0.12} />
            );
          })}

          {/* Active dots */}
          {filteredPinnable.map((g) => {
            const { x, y } = toSvgCoords(g.lat!, g.lng!, W, H);
            const isSelected = g.id === selectedId;
            return (
              <g key={g.id} onClick={() => onSelect(g.id)} style={{ cursor: "pointer" }}>
                {isSelected && (
                  <>
                    <circle cx={x} cy={y} r={20} fill="#C0392B" opacity={0.12} />
                    <circle cx={x} cy={y} r={13} fill="none" stroke="#C0392B" strokeWidth={1} opacity={0.5} />
                  </>
                )}
                <circle
                  cx={x} cy={y}
                  r={isSelected ? 8 : 6}
                  fill={isSelected ? "#C0392B" : "#F2EDE4"}
                  opacity={isSelected ? 1 : 0.75}
                />
                {/* City label */}
                <text
                  x={x + 11} y={y + 4}
                  fill={isSelected ? "#C0392B" : "#F2EDE4"}
                  fontSize={isSelected ? 10 : 8.5}
                  fontFamily="monospace"
                  fontWeight={isSelected ? "bold" : "normal"}
                  opacity={isSelected ? 1 : 0.5}
                >
                  {g.location.split(",")[0]}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <text x={12} y={H - 10} fill="#F2EDE4" fontSize={7} fontFamily="monospace" opacity={0.25}>
            LOCAL GROUPS ONLY · NATIONAL ORGS NOT PINNED · CLICK PIN TO SELECT
          </text>
        </svg>
      </div>

      {/* Side panel — selected group or instructions */}
      <div className="w-[300px] flex-none border-l border-[#1A1A1A] bg-[#F2EDE4] flex flex-col">
        {selected?.lat ? (
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[0.48rem] tracking-[0.12em] uppercase px-1.5 py-0.5 border font-bold flex-none ${
                  selected.scope === "National" ? "border-[#C0392B] text-[#C0392B]" : "border-[#1A1A1A] opacity-40"
                }`}>
                  {selected.scope}
                </span>
                {selected.focus.map((f) => (
                  <span key={f} className="text-[0.45rem] tracking-[0.1em] uppercase px-1.5 py-0.5 border border-[#1A1A1A] opacity-35 flex-none">
                    {f}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onSelect(selected.id)}
                className="opacity-30 hover:opacity-70 transition-opacity cursor-pointer flex-none ml-2 mt-0.5"
              >
                <X size={13} />
              </button>
            </div>

            <div className="bebas text-[1.3rem] leading-tight tracking-[0.02em] mb-1">
              {selected.name}
            </div>
            <div className="text-[0.55rem] tracking-[0.08em] opacity-35 flex items-center gap-1 mb-4">
              <MapPin size={9} /> {selected.location}
            </div>

            <p className="text-[0.68rem] leading-[1.85] opacity-65 flex-1 overflow-y-auto">
              {selected.description}
            </p>

            {selected.win && (
              <div className="mt-4 pl-2 border-l-2 border-[#C0392B] text-[0.6rem] tracking-[0.04em] opacity-65">
                ✓ {selected.win}
              </div>
            )}

            <a
              href={selected.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-4 py-2.5 text-[0.6rem] font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B] self-start"
            >
              Visit Group <ExternalLink size={10} />
            </a>
          </div>
        ) : (
          <div className="p-5 flex flex-col justify-center h-full opacity-30">
            <MapPin size={22} className="mb-3" />
            <div className="bebas text-[1rem] tracking-[0.04em] mb-1">Select a pin</div>
            <p className="text-[0.62rem] leading-[1.7]">
              Click any dot on the map to see details about that local group.
              National organizations aren't pinned — use the list view to browse them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Group card (list view) ──────────────────────────────────── */
function GroupCard({
  group,
  selected,
  onSelect,
}: {
  group: Group;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`border p-4 cursor-pointer transition-all ${
        selected
          ? "border-[#C0392B] bg-[#1A1A1A] text-[#F2EDE4]"
          : "border-[#1A1A1A] hover:border-[#C0392B]"
      }`}
    >
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className={`text-[0.5rem] tracking-[0.12em] uppercase px-1.5 py-0.5 border font-bold flex-none ${
          selected
            ? group.scope === "National" ? "border-[#C0392B] text-[#C0392B]" : "border-[#F2EDE4] text-[#F2EDE4] opacity-60"
            : group.scope === "National" ? "border-[#C0392B] text-[#C0392B]" : "border-[#1A1A1A] opacity-40"
        }`}>
          {group.scope}
        </span>
        {group.focus.map((f) => (
          <span key={f} className={`text-[0.48rem] tracking-[0.1em] uppercase px-1.5 py-0.5 border flex-none ${
            selected ? "border-[#F2EDE4] opacity-40" : "border-[#1A1A1A] opacity-35"
          }`}>
            {f}
          </span>
        ))}
      </div>

      <div className="bebas text-[1.05rem] leading-tight tracking-[0.02em] mb-0.5">{group.name}</div>
      <div className={`text-[0.55rem] tracking-[0.08em] flex items-center gap-1 mb-3 ${selected ? "opacity-50" : "opacity-35"}`}>
        <MapPin size={9} /> {group.location}
      </div>

      <p className={`text-[0.67rem] leading-[1.8] mb-3 ${selected ? "opacity-75" : "opacity-55"}`}>
        {group.description}
      </p>

      {group.win && (
        <div className={`text-[0.58rem] tracking-[0.06em] mb-3 pl-2 border-l-2 border-[#C0392B] ${selected ? "opacity-80" : "opacity-60"}`}>
          ✓ {group.win}
        </div>
      )}

      <a
        href={group.url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1 text-[0.55rem] tracking-[0.1em] uppercase border px-2.5 py-1 no-underline transition-all ${
          selected
            ? "border-[#F2EDE4] text-[#F2EDE4] hover:border-[#C0392B] hover:text-[#C0392B]"
            : "border-[#1A1A1A] opacity-50 hover:opacity-100 hover:border-[#C0392B] hover:text-[#C0392B]"
        }`}
      >
        Visit ↗ <ExternalLink size={9} />
      </a>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function GroupsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<Scope | null>(null);
  const [focusFilter, setFocusFilter] = useState<Focus | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  const filtered = useMemo(() => {
    return GROUPS.filter((g) => {
      const matchQuery =
        !query ||
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.location.toLowerCase().includes(query.toLowerCase()) ||
        g.description.toLowerCase().includes(query.toLowerCase());
      const matchScope = !scopeFilter || g.scope === scopeFilter;
      const matchFocus = !focusFilter || g.focus.includes(focusFilter);
      return matchQuery && matchScope && matchFocus;
    });
  }, [query, scopeFilter, focusFilter]);

  const handleMapSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="flex-1 bg-[#F2EDE4] text-[#1A1A1A] font-mono flex flex-col overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>

      {/* Page header */}
      <div className="border-b-2 border-[#1A1A1A] px-8 py-7 flex items-end justify-between flex-none">
        <div>
          <span className="text-[0.6rem] tracking-[0.14em] uppercase border border-[#1A1A1A] px-1.5 py-0.5 inline-block mb-3 opacity-60">
            Find Groups
          </span>
          <h1 className="bebas text-[clamp(2rem,3.5vw,3.2rem)] leading-[0.9] tracking-[0.02em]">
            YOU ARE  <span className="text-[#C0392B]">NOT ALONE</span> IN THIS.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[0.65rem] leading-[1.7] opacity-45 max-w-[260px] text-right">
            30+ localities have canceled Flock contracts since 2025. Organized communities win.
          </p>
          <button
            type="button"
            onClick={() => setShowSubmit(true)}
            className="bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-4 py-2 text-[0.62rem] font-bold tracking-[0.1em] uppercase transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B] cursor-pointer flex-none"
          >
            + Submit Group
          </button>
        </div>
      </div>

      {/* Filter + view toggle bar */}
      <div className="border-b border-[#1A1A1A] px-8 py-2.5 flex items-center gap-4 flex-none flex-wrap">
        {/* View toggle */}
        <div className="flex border border-[#1A1A1A] flex-none">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.55rem] tracking-[0.1em] uppercase transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-[#1A1A1A] text-[#F2EDE4]"
                : "bg-transparent opacity-40 hover:opacity-70"
            }`}
          >
            <LayoutList size={11} /> List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.55rem] tracking-[0.1em] uppercase border-l border-[#1A1A1A] transition-all cursor-pointer ${
              viewMode === "map"
                ? "bg-[#1A1A1A] text-[#F2EDE4]"
                : "bg-transparent opacity-40 hover:opacity-70"
            }`}
          >
            <Map size={11} /> Map
          </button>
        </div>

        <div className="w-px h-4 bg-[#1A1A1A] opacity-20 flex-none" />

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <Search size={12} className="opacity-30 flex-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groups or locations..."
            className="bg-transparent text-[0.7rem] tracking-[0.04em] outline-none placeholder:opacity-30 w-full"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="opacity-30 hover:opacity-70 cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>

        <div className="w-px h-4 bg-[#1A1A1A] opacity-20 flex-none" />

        {/* Scope */}
        <div className="flex items-center gap-1.5 flex-none">
          <Filter size={10} className="opacity-25 flex-none" />
          {ALL_SCOPES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setScopeFilter((prev) => (prev === s ? null : s))}
              className={`text-[0.52rem] tracking-[0.1em] uppercase px-2 py-0.5 border transition-all cursor-pointer ${
                scopeFilter === s ? "border-[#C0392B] text-[#C0392B]" : "border-[#1A1A1A] opacity-35 hover:opacity-70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-[#1A1A1A] opacity-20 flex-none" />

        {/* Focus */}
        <div className="flex items-center gap-1.5 flex-wrap flex-none">
          {ALL_FOCUS.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFocusFilter((prev) => (prev === f ? null : f))}
              className={`text-[0.52rem] tracking-[0.1em] uppercase px-2 py-0.5 border transition-all cursor-pointer ${
                focusFilter === f ? "border-[#C0392B] text-[#C0392B]" : "border-[#1A1A1A] opacity-35 hover:opacity-70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ml-auto text-[0.52rem] tracking-[0.1em] uppercase opacity-25 flex-none">
          {filtered.length}/{GROUPS.length}
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 min-h-0 overflow-hidden">

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="h-full overflow-y-auto px-8 py-6">
            {filtered.length === 0 ? (
              <div className="text-center py-16 opacity-30">
                <div className="bebas text-[1.5rem] mb-2">No groups found</div>
                <div className="text-[0.7rem]">Try adjusting your filters</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    selected={selectedId === g.id}
                    onSelect={() => setSelectedId((prev) => (prev === g.id ? null : g.id))}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAP VIEW */}
        {viewMode === "map" && (
          <div className="h-full">
            <GroupMap
              groups={filtered}
              allGroups={GROUPS}
              selectedId={selectedId}
              onSelect={handleMapSelect}
            />
          </div>
        )}
      </div>

      {/* Submit modal */}
      {showSubmit && (
        <div
          className="fixed inset-0 bg-[#1A1A1A] bg-opacity-80 z-50 flex items-center justify-center p-6"
          onClick={() => setShowSubmit(false)}
        >
          <div
            className="bg-[#F2EDE4] border-2 border-[#1A1A1A] max-w-[500px] w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="bebas text-[1.6rem] tracking-[0.02em]">Submit Your Group</div>
                <div className="text-[0.62rem] opacity-40 tracking-[0.06em] mt-0.5">
                  We'll review and add it to the directory.
                </div>
              </div>
              <button type="button" onClick={() => setShowSubmit(false)} className="opacity-30 hover:opacity-70 transition-opacity cursor-pointer mt-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Group name", placeholder: "Eyes Off Example City" },
                { label: "Location", placeholder: "City, State (or National)" },
                { label: "Website or social link", placeholder: "https://..." },
                { label: "Contact email", placeholder: "organizer@example.org" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-[0.58rem] tracking-[0.12em] uppercase opacity-50 block mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full bg-transparent border border-[#1A1A1A] px-3 py-2.5 text-[0.72rem] outline-none placeholder:opacity-25 focus:border-[#C0392B] transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-[0.58rem] tracking-[0.12em] uppercase opacity-50 block mb-1.5">Brief description</label>
                <textarea
                  rows={3}
                  placeholder="What does your group do? What are you fighting?"
                  className="w-full bg-transparent border border-[#1A1A1A] px-3 py-2.5 text-[0.72rem] outline-none placeholder:opacity-25 focus:border-[#C0392B] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href="mailto:submit@dropflock.org?subject=Group%20Submission"
                className="flex-1 bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-5 py-2.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase no-underline text-center transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B] block"
              >
                Send via Email
              </a>
              <button
                type="button"
                onClick={() => setShowSubmit(false)}
                className="border border-[#1A1A1A] px-5 py-2.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase opacity-40 hover:opacity-80 transition-opacity cursor-pointer bg-transparent"
              >
                Cancel
              </button>
            </div>
            <p className="text-[0.55rem] opacity-30 mt-3 tracking-[0.05em]">
              Submissions reviewed manually — typically added within a few days.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
"use client";

import { ExternalLink, MapPin, X, LayoutList, Map as MapIcon, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Group } from "../lib/api";

const US_BOUNDS = { minLat: 24, maxLat: 50, minLng: -125, maxLng: -66 };

function toSvgCoords(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - US_BOUNDS.minLng) / (US_BOUNDS.maxLng - US_BOUNDS.minLng)) * w;
  const y = (1 - (lat - US_BOUNDS.minLat) / (US_BOUNDS.maxLat - US_BOUNDS.minLat)) * h;
  return { x, y };
}

const ALL_SCOPES = ["National", "State", "Local"] as const;
const ALL_FOCUS = ["Legal", "Organizing", "Research", "Policy", "Tools"] as const;

type ViewMode = "list" | "map";

export function GroupsBrowser({ groups }: { groups: Group[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<string | null>(null);
  const [focusFilter, setFocusFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const matchQuery =
        !query ||
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.location.toLowerCase().includes(query.toLowerCase()) ||
        (g.slug ?? "").toLowerCase().includes(query.toLowerCase());
      const matchScope = !scopeFilter || g.scope === scopeFilter;
      const matchFocus = !focusFilter || g.focus?.includes(focusFilter);
      return matchQuery && matchScope && matchFocus;
    });
  }, [groups, query, scopeFilter, focusFilter]);

  return (
    <>
      {/* Filter + view toggle bar */}
      <div className="border-b border-[#1A1A1A] px-5 sm:px-8 py-2.5 flex items-center gap-x-4 gap-y-2 flex-none flex-wrap">
        <div className="flex border border-[#1A1A1A] flex-none">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.55rem] tracking-[0.1em] uppercase transition-all cursor-pointer ${
              viewMode === "list" ? "bg-[#1A1A1A] text-[#F2EDE4]" : "bg-transparent opacity-40 hover:opacity-70"
            }`}
          >
            <LayoutList size={11} /> List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.55rem] tracking-[0.1em] uppercase border-l border-[#1A1A1A] transition-all cursor-pointer ${
              viewMode === "map" ? "bg-[#1A1A1A] text-[#F2EDE4]" : "bg-transparent opacity-40 hover:opacity-70"
            }`}
          >
            <MapIcon size={11} /> Map
          </button>
        </div>

        <div className="w-px h-4 bg-[#1A1A1A] opacity-20 flex-none" />

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
          {filtered.length}/{groups.length}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === "list" ? (
          <div className="h-full overflow-y-auto px-5 sm:px-8 py-6">
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
                    selected={String(g.id) === selectedId}
                    onSelect={() => setSelectedId((prev) => (prev === String(g.id) ? null : String(g.id)))}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <GroupMap
            groups={filtered}
            allGroups={groups}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
          />
        )}
      </div>
    </>
  );
}

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
        {(group.focus ?? []).map((f) => (
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

      {group.win && (
        <div className={`text-[0.58rem] tracking-[0.06em] mb-3 pl-2 border-l-2 border-[#C0392B] ${selected ? "opacity-80" : "opacity-60"}`}>
          ✓ {group.win}
        </div>
      )}

      {group.url && (
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
      )}
    </div>
  );
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
  const allPinnable = allGroups.filter((g) => g.lat != null && g.lng != null);
  const filteredPinnable = groups.filter((g) => g.lat != null && g.lng != null);
  const filteredIds = new Set(filteredPinnable.map((g) => String(g.id)));
  const selected = allGroups.find((g) => String(g.id) === selectedId) ?? null;

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0">
      <div className="flex-1 relative bg-[#1A1A1A] min-h-[280px] md:min-h-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ display: "block" }}>
          <rect width={W} height={H} fill="#1A1A1A" />
          {[0.2, 0.4, 0.6, 0.8].map((f) => (
            <g key={f}>
              <line x1={f * W} y1={0} x2={f * W} y2={H} stroke="#F2EDE4" strokeWidth={0.4} opacity={0.05} />
              <line x1={0} y1={f * H} x2={W} y2={f * H} stroke="#F2EDE4" strokeWidth={0.4} opacity={0.05} />
            </g>
          ))}
          <text x={W / 2} y={H / 2 + 30} textAnchor="middle" fill="#F2EDE4" opacity={0.03}
            fontSize={130} fontFamily="monospace" fontWeight="bold" letterSpacing={8}>
            USA
          </text>
          {allPinnable.filter((g) => !filteredIds.has(String(g.id))).map((g) => {
            const { x, y } = toSvgCoords(g.lat!, g.lng!, W, H);
            return <circle key={g.id} cx={x} cy={y} r={4} fill="#F2EDE4" opacity={0.12} />;
          })}
          {filteredPinnable.map((g) => {
            const { x, y } = toSvgCoords(g.lat!, g.lng!, W, H);
            const isSelected = String(g.id) === selectedId;
            return (
              <g key={g.id} onClick={() => onSelect(String(g.id))} style={{ cursor: "pointer" }}>
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
          <text x={12} y={H - 10} fill="#F2EDE4" fontSize={7} fontFamily="monospace" opacity={0.25}>
            LOCAL GROUPS ONLY · NATIONAL ORGS NOT PINNED · CLICK PIN TO SELECT
          </text>
        </svg>
      </div>

      <div className="w-full md:w-[300px] flex-none border-t md:border-t-0 md:border-l border-[#1A1A1A] bg-[#F2EDE4] flex flex-col max-h-[40vh] md:max-h-none overflow-y-auto md:overflow-visible">
        {selected?.lat != null ? (
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[0.48rem] tracking-[0.12em] uppercase px-1.5 py-0.5 border font-bold flex-none ${
                  selected.scope === "National" ? "border-[#C0392B] text-[#C0392B]" : "border-[#1A1A1A] opacity-40"
                }`}>
                  {selected.scope}
                </span>
                {(selected.focus ?? []).map((f) => (
                  <span key={f} className="text-[0.45rem] tracking-[0.1em] uppercase px-1.5 py-0.5 border border-[#1A1A1A] opacity-35 flex-none">
                    {f}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onSelect(String(selected.id))}
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

            {selected.win && (
              <div className="mt-2 pl-2 border-l-2 border-[#C0392B] text-[0.6rem] tracking-[0.04em] opacity-65">
                ✓ {selected.win}
              </div>
            )}

            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-4 py-2.5 text-[0.6rem] font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B] self-start"
              >
                Visit Group <ExternalLink size={10} />
              </a>
            )}
          </div>
        ) : (
          <div className="p-5 flex flex-col justify-center h-full opacity-30">
            <MapPin size={22} className="mb-3" />
            <div className="bebas text-[1rem] tracking-[0.04em] mb-1">Select a pin</div>
            <p className="text-[0.62rem] leading-[1.7]">
              Click any dot on the map to see details about that local group.
              National organizations aren&apos;t pinned — use the list view to browse them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

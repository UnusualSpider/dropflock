"use client";

import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";

export type FindingCardProps = {
  id: number;
  slug: string;
  severity: string;
  device: string;
  title: string;
  body: string;
  source: string;
  source_url: string;
};

function SeverityBadge({ level }: { level: string }) {
  const color =
    level === "CRITICAL"
      ? "bg-[#C0392B] text-[#F2EDE4] border-[#C0392B]"
      : "bg-transparent text-[#C0392B] border-[#C0392B]";
  return (
    <span className={`text-[0.5rem] tracking-[0.14em] font-bold px-1.5 py-0.5 border ${color} inline-block flex-none`}>
      {level}
    </span>
  );
}

export function FindingCard({ severity, device, title, body, source, source_url }: FindingCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#1A1A1A] mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3 sm:gap-4 bg-transparent border-none cursor-pointer group"
      >
        <SeverityBadge level={severity} />
        <div className="flex-1 min-w-0">
          <div className="text-[0.55rem] tracking-[0.12em] uppercase opacity-40 mb-1">
            {device} · {source}
          </div>
          <div className="bebas text-[1.1rem] leading-tight tracking-[0.02em] group-hover:text-[#C0392B] transition-colors">
            {title}
          </div>
        </div>
        <span className="flex-none opacity-40 mt-1 group-hover:opacity-100 transition-opacity">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-5 border-t border-[#1A1A1A] pt-4">
          <p className="text-[0.75rem] leading-[1.9] opacity-70 mb-4 max-w-[600px]">
            {body}
          </p>
          <a
            href={source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.1em] uppercase border border-[#1A1A1A] px-2.5 py-1 opacity-50 hover:opacity-100 hover:border-[#C0392B] hover:text-[#C0392B] transition-all no-underline"
          >
            {source} <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}

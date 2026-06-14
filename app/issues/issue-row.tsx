"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Source } from "../lib/api";

export type IssueRowProps = {
  tag: string;
  title: string;
  summary: string;
  body: string;
  sources: Source[];
  index: number;
};

export function IssueRow({ tag, title, summary, body, sources, index }: IssueRowProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-[#1A1A1A] ${index === 0 ? "border-t" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-5 sm:px-8 py-5 flex items-start gap-3 sm:gap-6 group cursor-pointer bg-transparent border-none"
      >
        <span className="flex-none mt-0.5 text-[0.55rem] tracking-[0.14em] uppercase border border-[#1A1A1A] opacity-50 px-1.5 py-0.5 self-start whitespace-nowrap">
          {tag}
        </span>

        <div className="flex-1 min-w-0">
          <div className="bebas text-[1.2rem] sm:text-[1.35rem] leading-tight tracking-[0.02em] group-hover:text-[#C0392B] transition-colors">
            {title}
          </div>
          <div className="text-[0.72rem] opacity-55 leading-[1.7] mt-1 max-w-[680px]">
            {summary}
          </div>
        </div>

        <span className="flex-none opacity-40 mt-1 group-hover:opacity-100 transition-opacity">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="px-5 sm:px-8 pb-7 sm:ml-14 border-l-2 border-[#C0392B] sm:ml-[3.5rem]">
          {body.split("\n\n").map((para, i) => (
            <p key={i.toString()} className="text-[0.78rem] leading-[1.9] opacity-70 mb-4 max-w-[640px]">
              {para}
            </p>
          ))}
          {sources.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="text-[0.55rem] tracking-[0.14em] uppercase opacity-35 self-center">
                Sources:
              </span>
              {sources.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="text-[0.6rem] tracking-[0.08em] uppercase border border-[#1A1A1A] px-2.5 py-1 opacity-50 hover:opacity-100 hover:border-[#C0392B] hover:text-[#C0392B] transition-all no-underline"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

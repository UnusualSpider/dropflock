"use client";

import { useState } from "react";
import { ExternalLink, Mail } from "lucide-react";
import type { Rep } from "../lib/api";

export function RepFinder() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reps, setReps] = useState<Rep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (zip.length < 5) return;
    setLoading(true);
    setError(null);
    setSubmitted(false);
    try {
      const res = await fetch(`/api/reps?zip=${encodeURIComponent(zip)}`, { cache: "no-store" });
      if (!res.ok) {
        setError(`Lookup failed (${res.status})`);
        setReps([]);
        return;
      }
      const json = (await res.json()) as { data?: Rep[]; error?: string };
      if (json.error) {
        setError(json.error);
        setReps([]);
        return;
      }
      setReps(json.data ?? []);
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
      setReps([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[#1A1A1A] p-5 sm:p-6">
      <div className="text-[0.55rem] tracking-[0.14em] uppercase opacity-40 mb-3">Step 1 of 4</div>
      <div className="bebas text-[1.5rem] tracking-[0.02em] mb-1">Find Your Representatives</div>
      <p className="text-[0.7rem] leading-[1.8] opacity-55 mb-5 max-w-[480px]">
        Enter your ZIP code to find your city council member, mayor, and state legislators.
        These are the people who approve — and can cancel — Flock contracts.
      </p>

      <div className="flex gap-0 max-w-[380px]">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => { setZip(e.target.value.replace(/\D/g, "")); setSubmitted(false); }}
          placeholder="ZIP CODE"
          className="flex-1 bg-transparent border border-[#1A1A1A] border-r-0 px-4 py-3 text-[0.8rem] tracking-[0.2em] outline-none placeholder:opacity-25 focus:border-[#C0392B] transition-colors font-mono"
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={zip.length < 5 || loading}
          className="bg-[#1A1A1A] text-[#F2EDE4] border border-[#1A1A1A] px-5 py-3 text-[0.62rem] font-bold tracking-[0.1em] uppercase transition-all hover:bg-[#C0392B] hover:border-[#C0392B] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Look Up"}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-[0.7rem] text-[#C0392B]">
          {error}
        </div>
      )}

      {submitted && reps.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[0.65rem] opacity-50 tracking-[0.06em] mb-3">
            Based on ZIP prefix <span className="font-bold">{zip.slice(0, 3)}</span>:
          </p>
          {reps.map((r) => (
            <a
              key={`${r.zip_prefix}-${r.name}-${r.role}`}
              href={r.contact_url || "#"}
              target={r.contact_url ? "_blank" : undefined}
              rel="noreferrer"
              className="flex items-center justify-between border border-[#1A1A1A] px-4 py-2.5 no-underline hover:border-[#C0392B] hover:text-[#C0392B] transition-all group"
            >
              <div>
                <div className="text-[0.68rem] tracking-[0.04em] font-bold">
                  {r.name} <span className="opacity-50 font-normal">— {r.role}</span>
                </div>
                <div className="text-[0.55rem] opacity-40 tracking-[0.06em] flex items-center gap-2">
                  <span>{r.level}</span>
                  {r.contact_email && (
                    <span className="flex items-center gap-1">
                      <Mail size={9} /> {r.contact_email}
                    </span>
                  )}
                </div>
              </div>
              {r.contact_url && (
                <ExternalLink size={12} className="opacity-30 group-hover:opacity-100 flex-none ml-3" />
              )}
            </a>
          ))}
        </div>
      )}

      {submitted && reps.length === 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[0.65rem] opacity-50 tracking-[0.06em] mb-3">
            We don&apos;t have curated reps for ZIP prefix <span className="font-bold">{zip.slice(0, 3)}</span> yet. Try these free lookup tools:
          </p>
          {[
            { label: "USA.gov — Find Local Officials", href: `https://www.usa.gov/elected-officials`, note: "City council, mayor, county reps" },
            { label: "Common Cause — Find Your Reps",  href: `https://www.commoncause.org/find-your-representative/?zip=${zip}`, note: "State + federal legislators" },
            { label: "Vote.org — Elected Officials",    href: `https://www.vote.org/elected-officials/`, note: "All levels of government" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-[#1A1A1A] px-4 py-2.5 no-underline hover:border-[#C0392B] hover:text-[#C0392B] transition-all group"
            >
              <div>
                <div className="text-[0.68rem] tracking-[0.04em] font-bold">{l.label}</div>
                <div className="text-[0.55rem] opacity-40 tracking-[0.06em]">{l.note}</div>
              </div>
              <ExternalLink size={12} className="opacity-30 group-hover:opacity-100 flex-none ml-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

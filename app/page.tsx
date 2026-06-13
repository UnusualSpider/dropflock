"use client";

import { Cctv } from 'lucide-react';


const STATS = [
  { n: "5,000+", label: "Cities with FLOCK" },
  { n: "4B+",   label: "Plate reads logged" },
  { n: "0",     label: "Ways to opt out", red: true },
];


/*
const TICKER_TEXT =
  "FLOCK SAFETY OPERATES IN 5,000+ CITIES \u00a0·\u00a0 OVER 4 BILLION LICENSE PLATE READS LOGGED \u00a0·\u00a0 CONTRACTS APPROVED WITHOUT PUBLIC DEBATE \u00a0·\u00a0 YOUR MOVEMENTS ARE BEING RECORDED \u00a0·\u00a0 ADMIN INTERFACES EXPOSED TO THE PUBLIC INTERNET \u00a0·\u00a0 ";

Ticker component idea — could be added back in later if we want it
      <div className="flex-none overflow-hidden whitespace-nowrap border-b border-[#1A1A1A] bg-[#C0392B] text-[#F2EDE4] py-1.5">
        <div className="ticker-inner text-[0.65rem] tracking-[0.15em] font-bold">
          {Array(4).fill(TICKER_TEXT).join("")}
        </div>
      </div>
*/
export default function HomePage() {
  return (
    <main className="min-h-screen md:h-screen flex flex-col md:overflow-hidden bg-[#F2EDE4] text-[#1A1A1A] font-mono">

      {/* ── Main content — fills remaining height on desktop, scrolls on mobile ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">

        {/* Left — hero copy */}
        <div className="border-b md:border-b-0 md:border-r border-[#1A1A1A] px-6 sm:px-10 py-10 md:py-0 flex flex-col justify-center gap-6 md:gap-8">
          <div>
            <span className="text-[0.6rem] tracking-[0.14em] uppercase border border-[#1A1A1A] px-1.5 py-0.5 inline-block mb-5 opacity-60">
              Automated License Plate Surveillance
            </span>
            <h1 className="bebas text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[0.92] tracking-[0.02em]">
              YOUR CITY IS<br />
              <span className="text-[#C0392B]">WATCHING</span><br />
              YOUR EVERY<br />MOVE
            </h1>
          </div>

          <p className="text-[0.8rem] leading-[1.8] opacity-70 max-w-[420px]">
            FLOCK Safety sells automated license plate reader cameras to cities and police
            departments nationwide. Every time you drive past one, your plate number,
            location, identifiable information, and timestamp are logged. The data is then
            shared across a network of 2,000+ agencies, often with no judicial oversight and no way to opt out.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/issues"
              className="bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-6 py-2.5 text-[0.72rem] font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B]"
            >
              See the Issues
            </a>
            <a
              href="/act"
              className="bg-transparent text-[#1A1A1A] border border-[#1A1A1A] px-6 py-2.5 text-[0.72rem] font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:bg-[#1A1A1A] hover:text-[#F2EDE4]"
            >
              Take Action
            </a>
          </div>
        </div>

        {/* Right — deflock.org embed */}
        <div className="flex flex-col min-h-[500px] md:min-h-0">

          {/* Attribution bar */}
          <div className="flex-none flex items-center justify-between border-b border-[#1A1A1A] px-3 sm:px-4 py-2 bg-[#1A1A1A] text-[#F2EDE4] gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Camera icon */}
              <Cctv
                className="text-[#C0392B] flex-none"
                size={20}
              />
              <div className="min-w-0">
                <div className="text-[0.62rem] font-bold tracking-[0.12em] uppercase truncate">
                  FLOCK Camera Map
                </div>
                <div className="hidden sm:block text-[0.55rem] opacity-50 tracking-[0.06em]">
                  See known FLOCK cameras near you
                </div>
              </div>
            </div>

            {/* Credit + open link */}
            <div className="flex items-center gap-2 sm:gap-3 flex-none">
              <div className="text-right">
                <div className="text-[0.5rem] opacity-40 tracking-[0.1em] uppercase mb-0.5">Powered by</div>
                <a
                  href="https://deflock.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.65rem] font-bold tracking-[0.08em] text-[#C0392B] no-underline hover:opacity-70 transition-opacity"
                >
                  deflock.org ↗
                </a>
              </div>
              <div className="hidden sm:block w-px h-6 bg-[#F2EDE4] opacity-10" />
              <a
                href="https://deflock.org"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-block text-[0.55rem] tracking-[0.1em] uppercase opacity-40 hover:opacity-70 transition-opacity no-underline text-[#F2EDE4] border border-[#F2EDE4] border-opacity-20 px-2 py-1"
              >
                Open full site
              </a>
            </div>
          </div>

          {/* Stats strip — compact, above the iframe */}
          <div className="flex-none flex border-b border-[#1A1A1A]">
            {STATS.map((s, i) => (
              <div
                key={i.toLocaleString()}
                className={`flex-1 px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 min-w-0 ${i < STATS.length - 1 ? "border-r border-[#1A1A1A]" : ""}`}
              >
                <div className={`bebas text-[1.3rem] sm:text-[1.6rem] leading-none flex-none ${s.red ? "text-[#C0392B]" : ""}`}>
                  {s.n}
                </div>
                <div className="text-[0.5rem] sm:text-[0.55rem] tracking-[0.1em] uppercase opacity-50 leading-tight min-w-0">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Iframe — fills all remaining space */}
          <div className="flex-1 relative min-h-[400px] md:min-h-0">
            <iframe
              title="FLOCK Camera Map — powered by deflock.org"
              src="https://maps.deflock.org"
              className="absolute inset-0 w-full h-full border-none"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="flex-none border-t border-[#1A1A1A] px-5 sm:px-8 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-0">
        <div className="bebas text-[1.1rem] tracking-[0.06em]">
          DROP<span className="text-[#C0392B]">FLOCK</span>
        </div>
        <div className="text-[0.58rem] opacity-35 tracking-[0.1em] uppercase">
          Not affiliated with FLOCK Safety Inc. · For informational purposes · {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}

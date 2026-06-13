"use client";

import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";

/* ─── Timeline events ─────────────────────────────────────────── */
const TIMELINE = [
  {
    date: "Feb 08, 2025",
    event: "GainSec makes initial contact with Flock Safety to report findings.",
  },
  {
    date: "Feb 10, 2025",
    event: "Flock Safety responds to initial disclosure.",
  },
  {
    date: "Mar 07, 2025",
    event: "Flock Safety submits CVE requests to MITRE for 10 of the vulnerabilities.",
  },
  {
    date: "May 05, 2025",
    event: "Flock Safety publishes a customer advisory about the gunshot detection and LPR findings — the first public acknowledgment.",
  },
  {
    date: "Jun 19, 2025",
    event: "GainSec publicly discloses findings: root shell on the Falcon/Sparrow LPR and debug shell on the Raven gunshot detection system.",
  },
  {
    date: "Jun 27, 2025",
    event: "First batch of CVEs published. GainSec discloses further vulnerabilities to Flock.",
  },
  {
    date: "Sep 19, 2025",
    event: "GainSec discloses root shell on the Bravo Compute Box (Device 3).",
  },
  {
    date: "Sep 27, 2025",
    event: "GainSec discloses wireless RCE, live camera feed access, DoS, and information disclosure vulnerabilities in the Falcon/Sparrow.",
  },
  {
    date: "Nov 05, 2025",
    event: "GainSec publishes formal white paper: \"Examining the Security Posture of an Anti-Crime Ecosystem\" — 51 findings, 22 assigned CVEs, 8 more pending.",
  },
  {
    date: "Nov 06, 2025",
    event: "Flock Safety publishes a blog post responding to the white paper, claiming \"none of the vulnerabilities have an impact on customers' ability to carry out their public safety objectives.\"",
    flock: true,
  },
  {
    date: "Nov 16, 2025",
    event: "Benn Jordan publishes \"We Hacked Flock Safety Cameras in Under 30 Seconds\" on YouTube, demonstrating six of the most critical findings to a mass audience.",
  },
  {
    date: "Dec 2025",
    event: "404 Media investigation, corroborated by Jordan and GainSec, reveals at least 60 Flock Condor PTZ cameras streaming live to the open internet with no authentication.",
  },
];

/* ─── Finding cards ───────────────────────────────────────────── */
const FINDINGS = [
  {
    id: "CVE-2025-59409",
    severity: "CRITICAL",
    device: "Falcon/Sparrow LPR",
    title: "Hardcoded Wi-Fi credentials in production firmware",
    body: `The Falcon and Sparrow license plate readers ship with development Wi-Fi credentials ("test_flck") stored in cleartext in their production firmware. Anyone within Wi-Fi range of a deployed camera can connect to it using these credentials — no tools required. From there, further exploitation becomes dramatically easier.`,
    source: "GainSec — CVE-2025-59409",
    sourceUrl: "https://gainsec.com/2025/09/27/fly-by-device-2-the-falcon-sparrow-gated-wireless-rce-camera-feed-dos-information-disclosure-and-more/",
  },
  {
    id: "CVE-2025-59407",
    severity: "CRITICAL",
    device: "Falcon/Sparrow LPR + Bravo Compute Box",
    title: "Hardcoded Java Keystore password exposes private keys",
    body: `The DetectionProcessing Android application (com.flocksafety.android.objects) bundles a Java Keystore file (flock_rye.bks) along with its hardcoded password ("flockhibiki17") directly in the application code. This keystore contains a private key. Any attacker with access to the APK — which can be pulled from a device — can extract the key material.`,
    source: "GainSec — CVE-2025-59407",
    sourceUrl: "https://gainsec.com/2025/09/27/fly-by-device-2-the-falcon-sparrow-gated-wireless-rce-camera-feed-dos-information-disclosure-and-more/",
  },
  {
    id: "BUTTON-RCE",
    severity: "HIGH",
    device: "Falcon/Sparrow LPR + Bravo Compute Box",
    title: "Physical button sequence activates Wi-Fi hotspot with shared password",
    body: `Pressing a button on the back of the LPR camera fewer than a handful of times activates an onboard Wi-Fi hotspot. That hotspot uses the same hardcoded password across all devices — meaning once you know the password for one camera, you know it for every camera in the fleet. GainSec demonstrated that this sequence can lead to a full wireless remote code execution (RCE) shell.`,
    source: "GainSec + DeleteMe Podcast Transcript",
    sourceUrl: "https://joindeleteme.com/podcast/what-the-hack-flock-safety-privacy-concerns/",
  },
  {
    id: "CONDOR-EXPOSURE",
    severity: "CRITICAL",
    device: "Condor PTZ Cameras",
    title: "Live camera feeds streaming to the open internet — no authentication",
    body: `At least 60 Flock Condor PTZ cameras were found accessible on the public internet with no authentication whatsoever. Anyone with a browser could view live video feeds, access 30 days of archived footage, and in some cases interact with administrative controls. A 404 Media reporter drove to Bakersfield, California and watched himself in real time on his phone as the camera livestreamed him to the open internet.`,
    source: "404 Media / PetaPixel / Benn Jordan",
    sourceUrl: "https://petapixel.com/2025/12/29/big-brother-left-the-door-open-flocks-ai-surveillance-cameras-exposed-to-the-internet/",
  },
  {
    id: "ROOT-SHELL",
    severity: "HIGH",
    device: "Falcon/Sparrow LPR + Raven + Bravo Compute Box",
    title: "Root shell obtained on all three core device types",
    body: `GainSec obtained full root shell access on all three major Flock hardware devices: the Raven gunshot detection system, the Falcon/Sparrow LPR camera, and the Bravo Edge AI Compute Box. All devices ran outdated, end-of-life versions of Android with debugging features left enabled in production firmware — a fundamental hardening failure.`,
    source: "GainSec white paper — gainsec.com",
    sourceUrl: "https://github.com/GainSec/anti-crime-ecosystem-research",
  },
  {
    id: "EOL-OS",
    severity: "HIGH",
    device: "All Devices",
    title: "End-of-life Android OS with debugging enabled in production",
    body: `The Falcon/Sparrow runs Android Things 8.1 — a version that Google discontinued support for, meaning it no longer receives security patches. Debug interfaces were left active in units deployed in the field. These are not minor oversights; they are foundational security failures that compound every other vulnerability on this list.`,
    source: "GainSec — Part 3 / Security Ledger Podcast",
    sourceUrl: "https://securityledger.com/2025/12/ai-surveillance-unmasking-flock-safetys-insecurities/",
  },
];

/* ─── Sub-components ─────────────────────────────────────────── */

function SeverityBadge({ level }: { level: string }) {
  const color =
    level === "CRITICAL"
      ? "bg-[#C0392B] text-[#F2EDE4] border-[#C0392B]"
      : "bg-transparent text-[#C0392B] border-[#C0392B]";
  return (
    <span
      className={`text-[0.5rem] tracking-[0.14em] font-bold px-1.5 py-0.5 border ${color} inline-block flex-none`}
    >
      {level}
    </span>
  );
}

function FindingCard({ f }: { f: (typeof FINDINGS)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#1A1A1A] mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3 sm:gap-4 bg-transparent border-none cursor-pointer group"
      >
        <SeverityBadge level={f.severity} />
        <div className="flex-1 min-w-0">
          <div className="text-[0.55rem] tracking-[0.12em] uppercase opacity-40 mb-1">
            {f.device} · {f.id}
          </div>
          <div className="bebas text-[1.1rem] leading-tight tracking-[0.02em] group-hover:text-[#C0392B] transition-colors">
            {f.title}
          </div>
        </div>
        <span className="flex-none opacity-40 mt-1 group-hover:opacity-100 transition-opacity">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-5 border-t border-[#1A1A1A] pt-4">
          <p className="text-[0.75rem] leading-[1.9] opacity-70 mb-4 max-w-[600px]">
            {f.body}
          </p>
          <a
            href={f.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.1em] uppercase border border-[#1A1A1A] px-2.5 py-1 opacity-50 hover:opacity-100 hover:border-[#C0392B] hover:text-[#C0392B] transition-all no-underline"
          >
            {f.source} <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function SecurityPage() {
  return (
    <main className="flex-1 bg-[#F2EDE4] text-[#1A1A1A] font-mono">

      {/* Page header */}
      <div className="border-b-2 border-[#1A1A1A] px-5 sm:px-8 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8">
        <div>
          <span className="text-[0.6rem] tracking-[0.14em] uppercase border border-[#1A1A1A] px-1.5 py-0.5 inline-block mb-4 opacity-60">
            Security Research
          </span>
          <h1 className="bebas text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
            THEY SAID<br />
            <span className="text-[#C0392B]">THEY WERE SECURE.</span><br />
            THEY WERE NOT.
          </h1>
        </div>
        <p className="text-[0.72rem] leading-[1.8] opacity-60 max-w-[360px] md:text-right pb-1">
          Independent researchers bought Flock devices off the secondhand market,
          cracked them open, and found 51 documented vulnerabilities — including
          hardcoded passwords, root shell access, and live camera feeds streaming
          to the open internet with no authentication.
        </p>
      </div>

      {/* Stat strip */}
      <div className="border-b-2 border-[#1A1A1A] grid grid-cols-2 md:grid-cols-4">
        {[
          { n: "51", label: "Total findings" },
          { n: "22+", label: "CVEs assigned" },
          { n: "3", label: "Devices fully rooted" },
          { n: "60+", label: "Cameras exposed publicly" },
        ].map((s, i) => (
          <div
            key={i.toLocaleString()}
            className={`px-4 sm:px-6 py-4 flex items-center gap-3 border-[#1A1A1A] ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b" : ""} md:border-b-0 ${i < 3 ? "md:border-r" : ""}`}
          >
            <div className="bebas text-[1.6rem] sm:text-[2rem] leading-none text-[#C0392B]">{s.n}</div>
            <div className="text-[0.55rem] tracking-[0.1em] uppercase opacity-50 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main content — two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-0">

        {/* Left — researcher intro + findings */}
        <div className="border-b lg:border-b-0 lg:border-r border-[#1A1A1A] px-5 sm:px-8 py-8">

          {/* Researcher bios */}
          <div className="mb-8">
            <div className="text-[0.6rem] tracking-[0.14em] uppercase opacity-40 mb-4">The Researchers</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-[#1A1A1A] p-4">
                <div className="bebas text-[1.1rem] tracking-[0.02em] mb-1">Jon "GainSec" Gaines</div>
                <div className="text-[0.62rem] tracking-[0.06em] opacity-50 mb-3">Independent Security Researcher</div>
                <p className="text-[0.7rem] leading-[1.8] opacity-65">
                  Purchased Flock devices on the secondhand market and tested them in an isolated lab — no production systems were accessed. Over roughly nine months, Gaines documented 51 security issues across all three core Flock hardware platforms and coordinated responsible disclosure with the company and MITRE.
                </p>
                <a
                  href="https://github.com/GainSec/anti-crime-ecosystem-research"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[0.55rem] tracking-[0.1em] uppercase text-[#C0392B] no-underline hover:opacity-70 transition-opacity"
                >
                  White paper ↗
                </a>
              </div>
              <div className="border border-[#1A1A1A] p-4">
                <div className="bebas text-[1.1rem] tracking-[0.02em] mb-1">Benn Jordan</div>
                <div className="text-[0.62rem] tracking-[0.06em] opacity-50 mb-3">Musician, Acoustic Scientist & YouTuber</div>
                <p className="text-[0.7rem] leading-[1.8] opacity-65">
                  Collaborated with Gaines and 404 Media to bring the technical findings to a mass audience. His November 2025 YouTube video — "We Hacked Flock Safety Cameras in Under 30 Seconds" — demonstrated six of the most severe vulnerabilities and drew widespread attention to the scope of the problem.
                </p>
                <a
                  href="https://www.youtube.com/watch?v=uB0gr7Fh6lY"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[0.55rem] tracking-[0.1em] uppercase text-[#C0392B] no-underline hover:opacity-70 transition-opacity"
                >
                  Watch on YouTube ↗
                </a>
              </div>
            </div>
          </div>

          {/* Key findings */}
          <div>
            <div className="text-[0.6rem] tracking-[0.14em] uppercase opacity-40 mb-4">
              Key Findings
            </div>
            {FINDINGS.map((f) => (
              <FindingCard key={f.id} f={f} />
            ))}
          </div>
        </div>

        {/* Right — Flock's response + timeline */}
        <div className="flex flex-col">

          {/* Flock's response callout */}
          <div className="border-b border-[#1A1A1A] p-5 sm:p-6">
            <div className="text-[0.55rem] tracking-[0.14em] uppercase opacity-40 mb-3">
              Flock's Official Response — Nov 6, 2025
            </div>
            <blockquote className="border-l-2 border-[#C0392B] pl-4 mb-4">
              <p className="text-[0.72rem] leading-[1.8] opacity-80 italic">
                "Overall, none of the vulnerabilities detailed in the report have an impact on our customers' ability to carry out their public safety objectives. Exploitation of these vulnerabilities would not only require physical access to a device, but also require intimate knowledge of internal device hardware."
              </p>
              <footer className="text-[0.55rem] tracking-[0.08em] uppercase opacity-40 mt-2">
                — Flock Safety blog, Nov 6, 2025
              </footer>
            </blockquote>
            <div className="bg-[#1A1A1A] text-[#F2EDE4] p-3">
              <div className="text-[0.55rem] tracking-[0.14em] uppercase text-[#C0392B] mb-2 font-bold">
                Why that response is misleading
              </div>
              <p className="text-[0.65rem] leading-[1.8] opacity-80">
                Wireless RCE was demonstrated without any physical device access. The Condor camera exposure required nothing but a browser. The claim that exploitation requires physical access was directly contradicted by the researchers' own published proof-of-concept work — released the day before Flock's statement.
              </p>
            </div>
            <a
              href="https://www.flocksafety.com/blog/response-to-compiled-security-research-on-flock-safety-devices"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[0.55rem] tracking-[0.08em] uppercase opacity-40 hover:opacity-80 hover:text-[#C0392B] transition-all no-underline"
            >
              Read Flock's full statement ↗
            </a>
          </div>

          {/* Disclosure timeline */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="text-[0.55rem] tracking-[0.14em] uppercase opacity-40 mb-4">
              Disclosure Timeline
            </div>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-0 bottom-0 w-px bg-[#1A1A1A] opacity-15" />

              {TIMELINE.map((t, i) => (
                <div key={i.toLocaleString()} className="relative pl-5 mb-5 grid gap-1">
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-[5px] w-[11px] h-[11px] border-2 ${
                      t.flock
                        ? "border-[#C0392B] bg-[#C0392B]"
                        : "border-[#1A1A1A] bg-[#F2EDE4]"
                    }`}
                  />
                  <div
                    className={`text-[0.52rem] tracking-[0.1em] uppercase mb-0.5 ${
                      t.flock ? "text-[#C0392B]" : "opacity-35"
                    }`}
                  >
                    {t.date}
                    {t.flock && " — Flock Safety"}
                  </div>
                  <p className="text-[0.67rem] leading-[1.7] opacity-70">{t.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="border-t-2 border-[#1A1A1A] px-5 sm:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="bebas text-[1.2rem] sm:text-[1.4rem] tracking-[0.02em]">READ THE PRIMARY SOURCES</div>
          <div className="text-[0.65rem] opacity-45 tracking-[0.06em] mt-0.5">
            Everything above is documented. Here's where to go deeper.
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "GainSec White Paper", href: "https://github.com/GainSec/anti-crime-ecosystem-research" },
            { label: "Benn Jordan — YouTube", href: "https://www.youtube.com/watch?v=uB0gr7Fh6lY" },
            { label: "404 Media Investigation", href: "https://www.404media.co/flock-exposed-its-ai-powered-cameras-to-the-internet-we-tracked-ourselves/" },
            { label: "Flock's Response", href: "https://www.flocksafety.com/blog/response-to-compiled-security-research-on-flock-safety-devices" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="text-[0.62rem] tracking-[0.08em] uppercase border border-[#1A1A1A] px-3 py-2 opacity-60 hover:opacity-100 hover:border-[#C0392B] hover:text-[#C0392B] transition-all no-underline inline-flex items-center gap-1.5"
            >
              {l.label} <ExternalLink size={10} />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
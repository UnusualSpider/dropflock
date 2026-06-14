import { ExternalLink } from "lucide-react";
import { api } from "../lib/api";
import { FindingCard } from "./finding-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Researcher bios stay in code — they're editorial content, not data.
const RESEARCHERS = [
  {
    name: "Jon \"GainSec\" Gaines",
    role: "Independent Security Researcher",
    bio: "Purchased Flock devices on the secondhand market and tested them in an isolated lab — no production systems were accessed. Over roughly nine months, Gaines documented 51 security issues across all three core Flock hardware platforms and coordinated responsible disclosure with the company and MITRE.",
    link: { label: "White paper ↗", href: "https://github.com/GainSec/anti-crime-ecosystem-research" },
  },
  {
    name: "Benn Jordan",
    role: "Musician, Acoustic Scientist & YouTuber",
    bio: "Collaborated with Gaines and 404 Media to bring the technical findings to a mass audience. His November 2025 YouTube video — \"We Hacked Flock Safety Cameras in Under 30 Seconds\" — demonstrated six of the most severe vulnerabilities and drew widespread attention to the scope of the problem.",
    link: { label: "Watch on YouTube ↗", href: "https://www.youtube.com/watch?v=uB0gr7Fh6lY" },
  },
];

const PRIMARY_SOURCES = [
  { label: "GainSec White Paper", href: "https://github.com/GainSec/anti-crime-ecosystem-research" },
  { label: "Benn Jordan — YouTube", href: "https://www.youtube.com/watch?v=uB0gr7Fh6lY" },
  { label: "404 Media Investigation", href: "https://www.404media.co/flock-exposed-its-ai-powered-cameras-to-the-internet-we-tracked-ourselves/" },
  { label: "Flock's Response", href: "https://www.flocksafety.com/blog/response-to-compiled-security-research-on-flock-safety-devices" },
];

export default async function SecurityPage() {
  let incidents: Awaited<ReturnType<typeof api.listSecurityIncidents>> = [];
  let findings: Awaited<ReturnType<typeof api.listSecurityFindings>> = [];
  let stats: Awaited<ReturnType<typeof api.listStats>> = [];
  let loadError: string | null = null;

  try {
    [incidents, findings, stats] = await Promise.all([
      api.listSecurityIncidents(),
      api.listSecurityFindings(),
      api.listStats(["security.findings", "security.cves", "security.devices", "security.cameras"]),
    ]);
  } catch (err) {
    loadError = (err as Error).message;
  }

  const getStat = (key: string, fallback: string) => stats.find((s) => s.key === key)?.value ?? fallback;

  const findingsCount = getStat("security.findings", "51");
  const cvesCount = getStat("security.cves", "22+");
  const devicesCount = getStat("security.devices", "3");
  const camerasCount = getStat("security.cameras", "60+");

  return (
    <main className="flex-1 bg-[#F2EDE4] text-[#1A1A1A] font-mono">
      {loadError && (
        <div className="border-b border-[#1A1A1A] px-5 sm:px-8 py-3 text-[0.7rem] opacity-50">
          Couldn’t reach the security service: {loadError}. Some content below is empty until the backend is reachable.
        </div>
      )}

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
          cracked them open, and found {findingsCount} documented vulnerabilities — including
          hardcoded passwords, root shell access, and live camera feeds streaming
          to the open internet with no authentication.
        </p>
      </div>

      {/* Stat strip */}
      <div className="border-b-2 border-[#1A1A1A] grid grid-cols-2 md:grid-cols-4">
        {[
          { n: findingsCount, label: "Total findings" },
          { n: cvesCount, label: "CVEs assigned" },
          { n: devicesCount, label: "Devices fully rooted" },
          { n: camerasCount, label: "Cameras exposed publicly" },
        ].map((s, i) => (
          <div
            key={i.toString()}
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
              {RESEARCHERS.map((r) => (
                <div key={r.name} className="border border-[#1A1A1A] p-4">
                  <div className="bebas text-[1.1rem] tracking-[0.02em] mb-1">{r.name}</div>
                  <div className="text-[0.62rem] tracking-[0.06em] opacity-50 mb-3">{r.role}</div>
                  <p className="text-[0.7rem] leading-[1.8] opacity-65">{r.bio}</p>
                  <a
                    href={r.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[0.55rem] tracking-[0.1em] uppercase text-[#C0392B] no-underline hover:opacity-70 transition-opacity"
                  >
                    {r.link.label}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Key findings */}
          <div>
            <div className="text-[0.6rem] tracking-[0.14em] uppercase opacity-40 mb-4">
              Key Findings
            </div>
            {findings.length === 0 ? (
              <div className="border border-[#1A1A1A] p-5 text-[0.7rem] opacity-50">
                No findings published yet.
              </div>
            ) : (
              findings.map((f) => (
                <FindingCard
                  key={f.id}
                  id={f.id}
                  slug={f.slug}
                  severity={f.severity}
                  device={f.device}
                  title={f.title}
                  body={f.body}
                  source={f.source}
                  source_url={f.source_url}
                />
              ))
            )}
          </div>
        </div>

        {/* Right — Flock's response + timeline */}
        <div className="flex flex-col">
          {/* Flock's response callout */}
          <div className="border-b border-[#1A1A1A] p-5 sm:p-6">
            <div className="text-[0.55rem] tracking-[0.14em] uppercase opacity-40 mb-3">
              Flock&apos;s Official Response — Nov 6, 2025
            </div>
            <blockquote className="border-l-2 border-[#C0392B] pl-4 mb-4">
              <p className="text-[0.72rem] leading-[1.8] opacity-80 italic">
                &ldquo;Overall, none of the vulnerabilities detailed in the report have an impact on our customers&apos; ability to carry out their public safety objectives. Exploitation of these vulnerabilities would not only require physical access to a device, but also require intimate knowledge of internal device hardware.&rdquo;
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
                Wireless RCE was demonstrated without any physical device access. The Condor camera exposure required nothing but a browser. The claim that exploitation requires physical access was directly contradicted by the researchers&apos; own published proof-of-concept work — released the day before Flock&apos;s statement.
              </p>
            </div>
            <a
              href="https://www.flocksafety.com/blog/response-to-compiled-security-research-on-flock-safety-devices"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[0.55rem] tracking-[0.08em] uppercase opacity-40 hover:opacity-80 hover:text-[#C0392B] transition-all no-underline"
            >
              Read Flock&apos;s full statement ↗
            </a>
          </div>

          {/* Disclosure timeline */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="text-[0.55rem] tracking-[0.14em] uppercase opacity-40 mb-4">
              Disclosure Timeline
            </div>
            {incidents.length === 0 ? (
              <div className="text-[0.7rem] opacity-50">No timeline events yet.</div>
            ) : (
              <div className="relative">
                <div className="absolute left-[5px] top-0 bottom-0 w-px bg-[#1A1A1A] opacity-15" />
                {incidents.map((t) => (
                  <div key={t.id} className="relative pl-5 mb-5 grid gap-1">
                    <div
                      className={`absolute left-0 top-[5px] w-[11px] h-[11px] border-2 ${
                        t.flock_denied
                          ? "border-[#C0392B] bg-[#C0392B]"
                          : "border-[#1A1A1A] bg-[#F2EDE4]"
                      }`}
                    />
                    <div
                      className={`text-[0.52rem] tracking-[0.1em] uppercase mb-0.5 ${
                        t.flock_denied ? "text-[#C0392B]" : "opacity-35"
                      }`}
                    >
                      {t.date ?? "—"}{t.flock_denied ? " — Flock Safety" : ""}
                    </div>
                    <p className="text-[0.67rem] leading-[1.7] opacity-70">{t.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="border-t-2 border-[#1A1A1A] px-5 sm:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="bebas text-[1.2rem] sm:text-[1.4rem] tracking-[0.02em]">READ THE PRIMARY SOURCES</div>
          <div className="text-[0.65rem] opacity-45 tracking-[0.06em] mt-0.5">
            Everything above is documented. Here&apos;s where to go deeper.
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {PRIMARY_SOURCES.map((l) => (
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

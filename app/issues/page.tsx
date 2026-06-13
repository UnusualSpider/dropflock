"use client";


import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ISSUES = [
  {
    id: "01",
    tag: "Mass Surveillance",
    title: "Blanket tracking of innocent people",
    summary:
      "FLOCK cameras don't target suspects — they log every vehicle that passes by, creating a de facto record of where law-abiding citizens travel, when, and how often.",
    detail: `FLOCK's own marketing celebrates the scale: billions of plate reads, every day, across 5,000+ cities. The system doesn't require a crime to trigger a scan. Simply driving past a camera — near a clinic, a place of worship, a political rally, or a therapist's office — adds a timestamped record to a database that persists for months or years.

Courts have long held that isolated location data isn't a search. But the Supreme Court's Carpenter v. United States (2018) recognized that long-term, aggregated location tracking is different: it creates a "detailed chronicle of a person's physical presence" that implicates the Fourth Amendment. FLOCK's network does exactly that — at scale, automatically, and with no suspicion required.`,
    sources: [
      { label: "Carpenter v. United States (2018)", href: "https://www.oyez.org/cases/2017/16-402" },
      { label: "FLOCK Safety — About", href: "https://www.flocksafety.com/about" },
    ],
  },
  {
    id: "02",
    tag: "Data Sharing",
    title: "2,000+ agencies share your data — no warrant needed",
    summary:
      "When your plate is logged, it doesn't stay local. FLOCK's \"Falcon\" network lets any participating agency query any other agency's data — with no judicial oversight.",
    detail: `FLOCK operates a cross-agency data-sharing network called Falcon. A single plate read in your hometown can be queried by a police department in another state. Agencies sign up to share data as a condition of joining the network — meaning the geographic footprint of surveillance is far larger than the cameras in your city alone.

There is no standardized warrant or court-order requirement to run a query. Individual agencies set their own policies — and many have none at all. Investigative reporting by outlets including Wired and the Electronic Frontier Foundation has found that this creates a nationwide surveillance dragnet with virtually no judicial checks.`,
    sources: [
      { label: "EFF — License Plate Readers", href: "https://www.eff.org/issues/license-plates" },
      { label: "Wired — FLOCK's data network", href: "https://www.wired.com/tag/license-plate-readers/" },
    ],
  },
  {
    id: "03",
    tag: "No Opt-Out",
    title: "Zero ways to remove yourself from the database",
    summary:
      "There is no national opt-out registry, no deletion request process, and no right to know if your plate has been queried — in most states.",
    detail: `Unlike consumer data companies that must respond to deletion requests under laws like CCPA, law-enforcement-adjacent surveillance vendors like FLOCK operate in a nearly unregulated space. Only a handful of states have enacted ALPR-specific data governance laws, and even fewer give individuals the right to access or delete their own records.

If you drive past a FLOCK camera, your data is collected. If an agency queries your plate, you will almost certainly never know. If you want that data deleted, you have no mechanism to demand it in most jurisdictions. You are not a customer; you are the product.`,
    sources: [
      { label: "ACLU — License Plate Readers FAQ", href: "https://www.aclu.org/issues/privacy-technology/surveillance-technologies/license-plate-readers" },
    ],
  },
  {
    id: "04",
    tag: "Chilling Effects",
    title: "Surveillance changes behavior — even when you've done nothing wrong",
    summary:
      "Knowing you are watched changes how freely people move, associate, and exercise their rights. That chilling effect is itself a harm.",
    detail: `Research consistently shows that awareness of surveillance reduces participation in lawful activities: people visit religious sites less, attend protests less, and seek medical or mental health care less when they know their movements are being tracked. This is the chilling effect — surveillance doesn't need to result in an arrest to suppress freedom.

For FLOCK's network, the chilling effect is structural. Because data is retained and shared across agencies, anyone who drives near a protest, an immigration office, a reproductive health clinic, or a political event should reasonably expect that trip to be logged — potentially indefinitely. The mere existence of the network has a deterrent effect on constitutionally protected activity.`,
    sources: [
      { label: "PEN America — Chilling Effects", href: "https://pen.org/report/chilling-effects/" },
      { label: "NYU Law — Surveillance & Civil Liberties", href: "https://www.law.nyu.edu/centers/ili" },
    ],
  },
  {
    id: "05",
    tag: "Security",
    title: "Admin panels exposed to the public internet",
    summary:
      "FLOCK camera admin interfaces have been found accessible without authentication — putting sensitive law-enforcement data at risk.",
    detail: `Security researchers have identified FLOCK camera management interfaces reachable from the open internet, some without meaningful authentication controls. These interfaces can expose live camera feeds, stored plate reads, and configuration data.

This is not a theoretical risk. Any sufficiently motivated actor — a stalker, a foreign intelligence service, a domestic extremist — could potentially access location data on specific vehicles or individuals if these exposures are not patched. The sensitivity of ALPR data makes this a high-severity concern, yet FLOCK's contracts with municipalities rarely include binding security SLAs or mandatory disclosure of breaches.`,
    sources: [
      { label: "See our Security page", href: "/security" },
    ],
  },
  {
    id: "06",
    tag: "Accountability",
    title: "Contracts approved with no public debate",
    summary:
      "Many cities have signed multi-year FLOCK contracts through administrative channels — bypassing city council votes and public comment periods.",
    detail: `FLOCK has grown explosively in part because it sells to police departments and city managers who can approve contracts without a full council vote, often under spending thresholds that trigger public notice. Residents frequently learn their city has joined the FLOCK network only after the fact — if at all.

This procurement model sidelines democratic accountability. There is no public debate about data retention periods, sharing agreements, or use policies before cameras go up. When advocates later seek records through FOIA requests, they routinely find that contracts include broad confidentiality provisions that obscure the terms of the deal.`,
    sources: [
      { label: "Brennan Center — Police Tech Procurement", href: "https://www.brennancenter.org/our-work/research-reports/hidden-cameras-hidden-contracts" },
    ],
  },
];

function IssueRow({ issue, index }: { issue: typeof ISSUES[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border-b border-[#1A1A1A] ${index === 0 ? "border-t" : ""}`}>
      {/* Row header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-5 sm:px-8 py-5 flex items-start gap-3 sm:gap-6 group cursor-pointer bg-transparent border-none"
      >


        {/* Tag */}
        <span className="flex-none mt-0.5 text-[0.55rem] tracking-[0.14em] uppercase border border-[#1A1A1A] opacity-50 px-1.5 py-0.5 self-start whitespace-nowrap">
          {issue.tag}
        </span>

        {/* Title + summary */}
        <div className="flex-1 min-w-0">
          <div className="bebas text-[1.2rem] sm:text-[1.35rem] leading-tight tracking-[0.02em] group-hover:text-[#C0392B] transition-colors">
            {issue.title}
          </div>
          <div className="text-[0.72rem] opacity-55 leading-[1.7] mt-1 max-w-[680px]">
            {issue.summary}
          </div>
        </div>

        {/* Chevron */}
        <span className="flex-none opacity-40 mt-1 group-hover:opacity-100 transition-opacity">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 sm:px-8 pb-7 sm:ml-14 border-l-2 border-[#C0392B] sm:ml-[3.5rem]">
          {issue.detail.split("\n\n").map((para, i) => (
            <p key={i.toLocaleString()} className="text-[0.78rem] leading-[1.9] opacity-70 mb-4 max-w-[640px]">
              {para}
            </p>
          ))}
          {issue.sources.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="text-[0.55rem] tracking-[0.14em] uppercase opacity-35 self-center">
                Sources:
              </span>
              {issue.sources.map((s) => (
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

export default function IssuesPage() {
  return (
    <main className="flex-1 bg-[#F2EDE4] text-[#1A1A1A] font-mono">

      {/* Page header */}
      <div className="border-b-2 border-[#1A1A1A] px-5 sm:px-8 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8">
        <div>
          <span className="text-[0.6rem] tracking-[0.14em] uppercase border border-[#1A1A1A] px-1.5 py-0.5 inline-block mb-4 opacity-60">
            The Problems
          </span>
          <h1 className="bebas text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
            WHY FLOCK<br />
            <span className="text-[#C0392B]">IS A PROBLEM</span>
          </h1>
        </div>
        <p className="text-[0.72rem] leading-[1.8] opacity-60 max-w-[380px] md:text-right pb-1">
          Six documented issues with FLOCK Safety's automated license plate
          reader network — from constitutional concerns to security failures to
          the total absence of democratic oversight.
        </p>
      </div>

      {/* Issues list */}
      <div>
        {ISSUES.map((issue, i) => (
          <IssueRow key={issue.id} issue={issue} index={i} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="border-t-2 border-[#1A1A1A] px-5 sm:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="bebas text-[1.4rem] sm:text-[1.6rem] tracking-[0.02em]">
            READY TO PUSH BACK?
          </div>
          <div className="text-[0.7rem] opacity-50 tracking-[0.08em] mt-1">
            Knowing the problem is step one. Here's what to do next.
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/act"
            className="bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-6 py-2.5 text-[0.72rem] font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B]"
          >
            Take Action
          </a>
          <a
            href="/security"
            className="bg-transparent text-[#1A1A1A] border border-[#1A1A1A] px-6 py-2.5 text-[0.72rem] font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:bg-[#1A1A1A] hover:text-[#F2EDE4]"
          >
            Security Findings
          </a>
        </div>
      </div>
    </main>
  );
}
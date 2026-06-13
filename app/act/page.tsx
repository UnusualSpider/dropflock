"use client";


import { Check, ChevronRight, Copy, ExternalLink, FileText, Mail, Megaphone, Phone,  Share2, Users } from "lucide-react";
import { useState } from "react";

/* ─── Rep finder ──────────────────────────────────────────────── */
function RepFinder() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleLookup = () => {
    if (zip.length < 5) return;
    setLoading(true);
    // Opens Google Civic API / USA.gov lookup — no API key needed for this UX pattern
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div className="border border-[#1A1A1A] p-6">
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

      {submitted && (
        <div className="mt-5 space-y-2">
          <p className="text-[0.65rem] opacity-50 tracking-[0.06em] mb-3">
            Find your officials directly via these sources:
          </p>
          {[
            {
              label: "USA.gov — Find Local Officials",
              href: `https://www.usa.gov/elected-officials`,
              note: "City council, mayor, county reps",
            },
            {
              label: "Common Cause — Find Your Reps",
              href: `https://www.commoncause.org/find-your-representative/?zip=${zip}`,
              note: "State + federal legislators",
            },
            {
              label: "Vote.org — Elected Officials",
              href: `https://www.vote.org/elected-officials/`,
              note: "All levels of government",
            },
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

/* ─── Copy-to-clipboard script block ──────────────────────────── */
function ScriptBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[#1A1A1A] mb-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1A1A1A] bg-[#1A1A1A] bg-opacity-5">
        <span className="text-[0.55rem] tracking-[0.12em] uppercase opacity-50">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-[0.52rem] tracking-[0.1em] uppercase opacity-40 hover:opacity-100 hover:text-[#C0392B] transition-all cursor-pointer bg-transparent border-none"
        >
          {copied ? <Check size={11} className="text-[#C0392B]" /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="px-4 py-3 text-[0.68rem] leading-[1.85] opacity-65 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

/* ─── Action section wrapper ──────────────────────────────────── */
function ActionSection({
  step,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  step: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#1A1A1A]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-8 py-5 flex items-center gap-5 group cursor-pointer bg-transparent border-none hover:bg-opacity-[0.02] transition-colors"
      >
        {/* Step number */}
        <div className={`flex-none w-8 h-8 border flex items-center justify-center transition-all ${open ? "border-[#C0392B] bg-[#C0392B] text-[#F2EDE4]" : "border-[#1A1A1A] opacity-30 group-hover:opacity-60"}`}>
          <span className="bebas text-[0.9rem] leading-none">{step}</span>
        </div>

        {/* Icon */}
        <Icon size={18} className={`flex-none transition-colors ${open ? "text-[#C0392B]" : "opacity-30 group-hover:opacity-60"}`} />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className={`bebas text-[1.3rem] leading-tight tracking-[0.02em] transition-colors ${open ? "text-[#C0392B]" : "group-hover:text-[#C0392B]"}`}>
            {title}
          </div>
          <div className="text-[0.62rem] opacity-40 tracking-[0.06em] mt-0.5">{subtitle}</div>
        </div>

        <ChevronRight size={15} className={`flex-none opacity-30 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="px-8 pb-8 border-t border-[#1A1A1A] pt-6 bg-[#1A1A1A] bg-opacity-[0.015]">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function ActPage() {
  return (
    <main className="flex-1 bg-[#F2EDE4] text-[#1A1A1A] font-mono">

      {/* Header */}
      <div className="border-b-2 border-[#1A1A1A] px-8 py-10 grid grid-cols-2 gap-8 items-end">
        <div>
          <span className="text-[0.6rem] tracking-[0.14em] uppercase border border-[#1A1A1A] px-1.5 py-0.5 inline-block mb-4 opacity-60">
            Take Action
          </span>
          <h1 className="bebas text-[clamp(2.8rem,5vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
            KNOWING IS<br />
            <span className="text-[#C0392B]">NOT ENOUGH.</span>
          </h1>
        </div>
        <div>
          <p className="text-[0.72rem] leading-[1.9] opacity-60 max-w-[440px]">
            At least 30 communities have successfully canceled Flock contracts since 2025.
            None of them had special powers. They showed up, made noise, and kept pushing.
            Here is exactly how to do the same.
          </p>
          {/* Win counter strip */}
          <div className="flex gap-6 mt-5">
            {[
              { n: "30+", label: "Contracts canceled" },
              { n: "23+", label: "Cities since Feb 2025" },
              { n: "0", label: "Special skills required", red: true },
            ].map((s) => (
              <div key={s.label}>
                <div className={`bebas text-[1.8rem] leading-none ${s.red ? "text-[#C0392B]" : ""}`}>{s.n}</div>
                <div className="text-[0.52rem] tracking-[0.1em] uppercase opacity-40 leading-tight mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar — visual steps */}
      <div className="border-b-2 border-[#1A1A1A] grid grid-cols-5">
        {[
          { n: "01", label: "Find Your Reps" },
          { n: "02", label: "Contact Them" },
          { n: "03", label: "Show Up" },
          { n: "04", label: "Spread the Word" },
          { n: "05", label: "Go Further" },
        ].map((s, i) => (
          <div
            key={s.n}
            className={`px-5 py-3 ${i < 4 ? "border-r border-[#1A1A1A]" : ""} flex items-center gap-3`}
          >
            <span className="bebas text-[1rem] text-[#C0392B] opacity-60">{s.n}</span>
            <span className="text-[0.55rem] tracking-[0.1em] uppercase opacity-40">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Action sections ── */}

      {/* 01 — Find reps */}
      <ActionSection
        step="01"
        icon={Phone}
        title="Find Your Representatives"
        subtitle="City council + mayor + state legislators — these are the decision makers"
      >
        <RepFinder />
        <div className="mt-4 border border-[#1A1A1A] p-4 bg-[#1A1A1A] bg-opacity-[0.03]">
          <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-2">Who to target, in order</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { role: "City Council Member", why: "Approves or cancels contracts at the local level. Most accessible and most impactful." },
              { role: "Mayor / City Manager", why: "Often signs contracts without a full council vote. Pressure them to bring it to a public vote." },
              { role: "State Legislators", why: "Can pass ALPR data governance laws. Several states have moved after constituent pressure." },
            ].map((r) => (
              <div key={r.role} className="border border-[#1A1A1A] p-3">
                <div className="bebas text-[0.9rem] tracking-[0.02em] mb-1">{r.role}</div>
                <p className="text-[0.62rem] leading-[1.75] opacity-55">{r.why}</p>
              </div>
            ))}
          </div>
        </div>
      </ActionSection>

      {/* 02 — Contact */}
      <ActionSection
        step="02"
        icon={Mail}
        title="Contact Them Directly"
        subtitle="Email, call, and show up at office hours — all three, in that order"
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-4">
              What to say — copy these
            </div>

            <ScriptBlock
              label="Email subject line"
              text="Please cancel our city's Flock Safety contract"
            />

            <ScriptBlock
              label="Email body (personalize the [brackets])"
              text={`Dear [Council Member Name],

I am a resident of [City] writing to urge you to cancel our contract with Flock Safety.

Flock's automated license plate reader network logs every vehicle that passes its cameras — including mine and your constituents' — and shares that data with 2,000+ agencies across the country with no judicial oversight and no way to opt out.

Security researchers found 51 documented vulnerabilities in Flock's hardware, including cameras streaming live footage to the open internet with no password. This is not a company that can be trusted with sensitive public data.

At least 30 other cities — including Austin, Cambridge, and Eugene — have already canceled their Flock contracts following organized community pressure.

I am asking you to:
1. Bring our Flock contract to a public vote
2. Disclose the data retention and sharing terms of that contract
3. Cancel it

I look forward to your response.

[Your name]
[Your address]`}
            />

            <ScriptBlock
              label="Phone call script (30 seconds)"
              text={`"Hi, my name is [Name] and I'm a constituent in [City]. I'm calling to ask [Council Member]'s office to cancel our city's contract with Flock Safety. Flock cameras collect data on every driver and share it with thousands of agencies nationwide with no oversight. At least 30 other cities have already canceled their contracts. I'd like [Council Member] to bring this to a public vote. Can I leave my contact info for a follow-up?"`}
            />
          </div>

          <div>
            <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-4">
              Tips that work
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Be specific about your city's contract",
                  body: "Look up whether your city actually has Flock cameras (check deflock.me) and mention the specific streets or neighborhoods. Generic emails get ignored; specific ones get responses.",
                },
                {
                  title: "Mention the wins in other cities",
                  body: "Austin, Cambridge, Eugene, Flagstaff, and 25+ more have canceled contracts. Elected officials respond to precedent. Name the cities.",
                },
                {
                  title: "Cc local journalists and advocacy groups",
                  body: "When officials know a journalist is watching, response rates go up dramatically. Find your local paper's city hall reporter and include them.",
                },
                {
                  title: "Follow up exactly once per week",
                  body: "One email, one call, once a week. Consistent, polite, relentless. Most officials respond within 2–3 contacts.",
                },
                {
                  title: "Ask for a meeting, not just a response",
                  body: "\"I'd love 15 minutes to discuss this\" is harder to ignore than \"please respond.\" In-person meetings are where contracts actually get reconsidered.",
                },
              ].map((t) => (
                <div key={t.title} className="border border-[#1A1A1A] p-3">
                  <div className="bebas text-[0.9rem] tracking-[0.02em] mb-1 leading-tight">{t.title}</div>
                  <p className="text-[0.62rem] leading-[1.75] opacity-55">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ActionSection>

      {/* 03 — Show up */}
      <ActionSection
        step="03"
        icon={Users}
        title="Show Up in Person"
        subtitle="City council public comment is your most powerful tool — use it"
      >
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border border-[#1A1A1A] p-5">
              <div className="bebas text-[1.1rem] tracking-[0.02em] mb-3">How public comment works</div>
              <div className="space-y-3">
                {[
                  ["Find the meeting", "Use alpr.watch — it scans council agendas for Flock keywords and alerts you when it comes up."],
                  ["Sign up to speak", "Most councils let you sign up online or at the door. You usually get 2–3 minutes."],
                  ["Bring receipts", "Print the GainSec white paper summary, the EFF audit, and your city's contract if you can FOIA it."],
                  ["Bring people", "Councils count heads. 10 people who show up beats 1,000 who sign a petition."],
                  ["Record it", "Public meetings are public. Recording council members' responses creates accountability."],
                ].map(([step, desc]) => (
                  <div key={step} className="flex gap-3">
                    <div className="flex-none w-px bg-[#C0392B] mt-1" style={{ minWidth: 2, height: "auto" }} />
                    <div>
                      <div className="text-[0.62rem] font-bold tracking-[0.06em] mb-0.5">{step}</div>
                      <p className="text-[0.62rem] leading-[1.75] opacity-55">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://alpr.watch"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-[#1A1A1A] px-4 py-3 no-underline hover:border-[#C0392B] hover:text-[#C0392B] transition-all group"
            >
              <div>
                <div className="bebas text-[1rem] tracking-[0.02em]">ALPR.watch</div>
                <div className="text-[0.58rem] opacity-40 tracking-[0.06em]">Get alerted when Flock appears on your council's agenda</div>
              </div>
              <ExternalLink size={13} className="opacity-30 group-hover:opacity-100 flex-none" />
            </a>
          </div>

          <div>
            <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-4">
              2-minute public comment script
            </div>
            <ScriptBlock
              label="Read aloud at city council — edit to fit your city"
              text={`"My name is [Name] and I've lived in [City] for [X] years.

I'm here to ask this council to cancel our contract with Flock Safety.

Every time one of my neighbors drives past a Flock camera, their license plate, location, and timestamp are logged — and shared with over 2,000 agencies across the country, many of them states away. There is no warrant required. There is no opt-out.

Independent security researchers documented 51 vulnerabilities in Flock's hardware last year, including cameras streaming live footage to the open internet with no password — in communities just like ours.

Austin canceled their contract. Cambridge canceled theirs. Eugene. Flagstaff. Over 30 cities in total.

I'm asking you to be the 31st. Bring this contract to a full public vote, disclose its terms, and cancel it.

Thank you."`}
            />

            <div className="border border-[#1A1A1A] p-4 mt-3">
              <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-2">After the meeting</div>
              <ul className="space-y-1.5">
                {[
                  "Post your video to local neighborhood groups and Next Door",
                  "Tag your council member on social media with the recording",
                  "File a FOIA/public records request for the full Flock contract",
                  "Connect with your local ACLU chapter — they often want to know",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-[0.63rem] leading-[1.7] opacity-60">
                    <span className="text-[#C0392B] flex-none">→</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </ActionSection>

      {/* 04 — Spread the word */}
      <ActionSection
        step="04"
        icon={Share2}
        title="Spread the Word"
        subtitle="Every person who learns about Flock is a potential organizer"
      >
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              platform: "Social media",
              actions: [
                "Share this site with the hashtag #DropFlock",
                "Post the Benn Jordan YouTube video — it's the most accessible explainer",
                "Tag your city council members directly when sharing local stories",
                "Screenshot the deflock.me map zoomed in on your neighborhood",
              ],
            },
            {
              platform: "In your community",
              actions: [
                "Print and post flyers at libraries, coffee shops, laundromats",
                "Bring it up at HOA, neighborhood, or PTA meetings",
                "Talk to local journalists — city hall reporters love this story",
                "Leave door hangers near known Flock camera locations",
              ],
            },
            {
              platform: "Online groups",
              actions: [
                "Post in local Facebook groups and Next Door",
                "Share in Reddit local subreddits (r/yourcity)",
                "Reach out to local Discord and Slack community servers",
                "Send to your local buy-nothing or mutual aid group",
              ],
            },
          ].map((s) => (
            <div key={s.platform} className="border border-[#1A1A1A] p-4">
              <div className="bebas text-[1rem] tracking-[0.02em] mb-3">{s.platform}</div>
              <ul className="space-y-2">
                {s.actions.map((a) => (
                  <li key={a} className="flex gap-2 text-[0.62rem] leading-[1.7] opacity-60">
                    <span className="text-[#C0392B] flex-none mt-0.5">·</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border border-[#1A1A1A] p-5">
          <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-3">Shareable resources</div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Benn Jordan's YouTube Video", href: "https://www.youtube.com/watch?v=uB0gr7Fh6lY" },
              { label: "GainSec White Paper", href: "https://github.com/GainSec/anti-crime-ecosystem-research" },
              { label: "EFF — ALPR Issues", href: "https://www.eff.org/issues/license-plates" },
              { label: "deflock.me Camera Map", href: "https://deflock.me" },
              { label: "Have I Been Flocked", href: "https://haveibeenflocked.com" },
              { label: "FLOCKOut Petition", href: "https://www.fightforthefuture.org/actions/flockout/" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.08em] uppercase border border-[#1A1A1A] px-3 py-1.5 no-underline opacity-55 hover:opacity-100 hover:border-[#C0392B] hover:text-[#C0392B] transition-all"
              >
                {l.label} <ExternalLink size={9} />
              </a>
            ))}
          </div>
        </div>
      </ActionSection>

      {/* 05 — Go further */}
      <ActionSection
        step="05"
        icon={Megaphone}
        title="Go Further"
        subtitle="For those ready to escalate — legal action, FOIA requests, legislation"
      >
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="border border-[#1A1A1A] p-5">
              <div className="bebas text-[1.1rem] tracking-[0.02em] mb-3 flex items-center gap-2">
                <FileText size={15} className="text-[#C0392B]" /> File a FOIA Request
              </div>
              <p className="text-[0.68rem] leading-[1.85] opacity-60 mb-4">
                Request your city's full Flock Safety contract, data retention policies, and any sharing agreements with other agencies. Many communities discovered their contracts had no data limits or oversight requirements only after filing.
              </p>
              <ScriptBlock
                label="FOIA request template"
                text={`To: [City Clerk / Records Office]
Subject: Public Records Request — Flock Safety Contract

Pursuant to [your state's open records law], I am requesting:

1. The full executed contract between [City] and Flock Safety, including all amendments and exhibits
2. Any data sharing agreements between [City] and third-party agencies via the Flock platform
3. Data retention policies for license plate reader data collected by Flock cameras in [City]
4. Any communications between [City] officials and Flock Safety regarding camera installation locations
5. A list of all locations where Flock cameras are deployed in [City]

Please provide these records in electronic format within the statutory timeframe.

[Your name]
[Your address]
[Your email]`}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-[#1A1A1A] p-5">
              <div className="bebas text-[1.1rem] tracking-[0.02em] mb-3">Escalation paths</div>
              <div className="space-y-3">
                {[
                  {
                    action: "Contact your ACLU state chapter",
                    detail: "State ACLU chapters have been the most effective legal partners in fighting Flock contracts. Cambridge, Eugene, and San Jose lawsuits all involved ACLU backing.",
                    href: "https://www.aclu.org/about/affiliates",
                  },
                  {
                    action: "Start or join a local group",
                    detail: "Eyes Off Eugene, Flock Off Ithaca, and TRUST Coalition all started with just a few people. Find your city on the Groups page or start your own.",
                    href: "/groups",
                  },
                  {
                    action: "Sign the FLOCKOut petition",
                    detail: "Fight for the Future's national petition signals to legislators that this is a voting issue. It takes 30 seconds.",
                    href: "https://www.fightforthefuture.org/actions/flockout/",
                  },
                  {
                    action: "Push for state legislation",
                    detail: "Oregon, New Jersey, Kentucky, and others are moving ALPR data governance bills. Contact your state rep to demand your state act next.",
                    href: "https://www.eff.org/issues/license-plates",
                  },
                ].map((e) => (
                  <a
                    key={e.action}
                    href={e.href}
                    target={e.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex items-start justify-between border border-[#1A1A1A] p-3 no-underline hover:border-[#C0392B] transition-all group"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="bebas text-[0.95rem] tracking-[0.02em] group-hover:text-[#C0392B] transition-colors leading-tight mb-1">{e.action}</div>
                      <p className="text-[0.6rem] leading-[1.75] opacity-50">{e.detail}</p>
                    </div>
                    <ExternalLink size={11} className="opacity-25 group-hover:opacity-80 flex-none mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ActionSection>

      {/* Bottom CTA */}
      <div className="border-t-2 border-[#1A1A1A] px-8 py-10 flex items-center justify-between">
        <div>
          <div className="bebas text-[1.6rem] tracking-[0.02em]">
            ALREADY ORGANIZED? <span className="text-[#C0392B]">GET LISTED.</span>
          </div>
          <div className="text-[0.68rem] opacity-45 tracking-[0.06em] mt-1">
            Add your group to our directory so others in your city can find you.
          </div>
        </div>
        <div className="flex gap-3">
          <a
            href="/groups"
            className="bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-6 py-2.5 text-[0.72rem] font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B]"
          >
            Find Groups
          </a>
          <a
            href="/issues"
            className="bg-transparent text-[#1A1A1A] border border-[#1A1A1A] px-6 py-2.5 text-[0.72rem] font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:bg-[#1A1A1A] hover:text-[#F2EDE4]"
          >
            The Issues
          </a>
        </div>
      </div>
    </main>
  );
}
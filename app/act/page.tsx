import { ChevronRight, ExternalLink, FileText, Mail, Megaphone, Phone, Share2, Users } from "lucide-react";
import { api } from "../lib/api";
import { RepFinder } from "./rep-finder";
import { CopyButton } from "./copy-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Hardcoded content: long-form scripts that don't belong in a CMS.
const SCRIPTS = {
  emailSubject: "Please cancel our city's Flock Safety contract",
  emailBody: `Dear [Council Member Name],

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
[Your address]`,
  phoneScript: `"Hi, my name is [Name] and I'm a constituent in [City]. I'm calling to ask [Council Member]'s office to cancel our city's contract with Flock Safety. Flock cameras collect data on every driver and share it with thousands of agencies nationwide with no oversight. At least 30 other cities have already canceled their contracts. I'd like [Council Member] to bring this to a public vote. Can I leave my contact info for a follow-up?"`,
  commentScript: `"My name is [Name] and I've lived in [City] for [X] years.

I'm here to ask this council to cancel our contract with Flock Safety.

Every time one of my neighbors drives past a Flock camera, their license plate, location, and timestamp are logged — and shared with over 2,000 agencies across the country, many of them states away. There is no warrant required. There is no opt-out.

Independent security researchers documented 51 vulnerabilities in Flock's hardware last year, including cameras streaming live footage to the open internet with no password — in communities just like ours.

Austin canceled their contract. Cambridge canceled theirs. Eugene. Flagstaff. Over 30 cities in total.

I'm asking you to be the 31st. Bring this contract to a full public vote, disclose its terms, and cancel it.

Thank you."`,
  foiaTemplate: `To: [City Clerk / Records Office]
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
[Your email]`,
};

const SECTIONS = [
  { step: "01", icon: Phone, title: "Find Your Representatives", subtitle: "City council + mayor + state legislators — these are the decision makers" },
  { step: "02", icon: Mail, title: "Contact Them Directly", subtitle: "Email, call, and show up at office hours — all three, in that order" },
  { step: "03", icon: Users, title: "Show Up in Person", subtitle: "City council public comment is your most powerful tool — use it" },
  { step: "04", icon: Share2, title: "Spread the Word", subtitle: "Every person who learns about Flock is a potential organizer" },
  { step: "05", icon: Megaphone, title: "Go Further", subtitle: "For those ready to escalate — legal action, FOIA requests, legislation" },
];

export default async function ActPage() {
  let targets: Awaited<ReturnType<typeof api.listTalkingPoints>> = [];
  let tips: Awaited<ReturnType<typeof api.listTalkingPoints>> = [];
  let comment: Awaited<ReturnType<typeof api.listTalkingPoints>> = [];
  let after: Awaited<ReturnType<typeof api.listTalkingPoints>> = [];
  let spread: Awaited<ReturnType<typeof api.listTalkingPoints>> = [];
  let escalate: Awaited<ReturnType<typeof api.listTalkingPoints>> = [];
  let shareable: Awaited<ReturnType<typeof api.listTalkingPoints>> = [];

  try {
    [targets, tips, comment, after, spread, escalate, shareable] = await Promise.all([
      api.listTalkingPoints("target"),
      api.listTalkingPoints("tip"),
      api.listTalkingPoints("comment"),
      api.listTalkingPoints("after"),
      api.listTalkingPoints("spread"),
      api.listTalkingPoints("escalate"),
      api.listTalkingPoints("shareable"),
    ]);
  } catch {
    // Empty arrays will produce the same UX as before, but with "no data"
    // placeholders. Acceptable: the page still renders and the static scripts
    // below are unaffected.
  }

  // Stats are also data — but the home page already pulls them. To keep the
  // act page self-contained we hardcode the win counters. If/when we want
  // them data-driven, swap for api.listStats(["act.contracts", ...]).
  const wins = [
    { n: "30+", label: "Contracts canceled" },
    { n: "23+", label: "Cities since Feb 2025" },
    { n: "0", label: "Special skills required", red: true },
  ];

  return (
    <main className="flex-1 bg-[#F2EDE4] text-[#1A1A1A] font-mono">
      {/* Header */}
      <div className="border-b-2 border-[#1A1A1A] px-5 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start md:items-end">
        <div>
          <span className="text-[0.6rem] tracking-[0.14em] uppercase border border-[#1A1A1A] px-1.5 py-0.5 inline-block mb-4 opacity-60">
            Take Action
          </span>
          <h1 className="bebas text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
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
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5">
            {wins.map((s) => (
              <div key={s.label}>
                <div className={`bebas text-[1.6rem] sm:text-[1.8rem] leading-none ${s.red ? "text-[#C0392B]" : ""}`}>{s.n}</div>
                <div className="text-[0.52rem] tracking-[0.1em] uppercase opacity-40 leading-tight mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar — visual steps */}
      <div className="border-b-2 border-[#1A1A1A] grid grid-cols-2 md:grid-cols-5">
        {SECTIONS.map((s, i) => (
          <div
            key={s.step}
            className={`px-4 sm:px-5 py-3 ${i < 4 ? "md:border-r border-[#1A1A1A]" : ""} ${i % 2 === 0 ? "border-r border-[#1A1A1A]" : ""} ${i < 2 ? "border-b md:border-b-0 border-[#1A1A1A]" : ""} flex items-center gap-3`}
          >
            <span className="bebas text-[1rem] text-[#C0392B] opacity-60 flex-none">{s.step}</span>
            <span className="text-[0.55rem] tracking-[0.1em] uppercase opacity-40 truncate">{s.title}</span>
          </div>
        ))}
      </div>

      {/* 01 — Find reps */}
      <Section
        step="01"
        icon={Phone}
        title="Find Your Representatives"
        subtitle="City council + mayor + state legislators — these are the decision makers"
      >
        <RepFinder />
        <div className="mt-4 border border-[#1A1A1A] p-4 bg-[#1A1A1A] bg-opacity-[0.03]">
          <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-2">Who to target, in order</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {targets.length === 0 ? (
              <div className="col-span-3 text-[0.7rem] opacity-50">No targets published yet.</div>
            ) : (
              targets.map((r) => (
                <div key={r.id} className="border border-[#1A1A1A] p-3">
                  <div className="bebas text-[0.9rem] tracking-[0.02em] mb-1">{r.title}</div>
                  <p className="text-[0.62rem] leading-[1.75] opacity-55">{r.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </Section>

      {/* 02 — Contact */}
      <Section
        step="02"
        icon={Mail}
        title="Contact Them Directly"
        subtitle="Email, call, and show up at office hours — all three, in that order"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-4">
              What to say — copy these
            </div>
            <ScriptBlock label="Email subject line" text={SCRIPTS.emailSubject} />
            <ScriptBlock label="Email body (personalize the [brackets])" text={SCRIPTS.emailBody} />
            <ScriptBlock label="Phone call script (30 seconds)" text={SCRIPTS.phoneScript} />
          </div>

          <div>
            <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-4">
              Tips that work
            </div>
            <div className="space-y-3">
              {tips.length === 0 ? (
                <div className="text-[0.7rem] opacity-50">No tips published yet.</div>
              ) : (
                tips.map((t) => (
                  <div key={t.id} className="border border-[#1A1A1A] p-3">
                    <div className="bebas text-[0.9rem] tracking-[0.02em] mb-1 leading-tight">{t.title}</div>
                    <p className="text-[0.62rem] leading-[1.75] opacity-55">{t.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* 03 — Show up */}
      <Section
        step="03"
        icon={Users}
        title="Show Up in Person"
        subtitle="City council public comment is your most powerful tool — use it"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border border-[#1A1A1A] p-5">
              <div className="bebas text-[1.1rem] tracking-[0.02em] mb-3">How public comment works</div>
              <div className="space-y-3">
                {comment.length === 0 ? (
                  <div className="text-[0.7rem] opacity-50">No steps published yet.</div>
                ) : (
                  comment.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="flex-none w-px bg-[#C0392B] mt-1" style={{ minWidth: 2, height: "auto" }} />
                      <div>
                        <div className="text-[0.62rem] font-bold tracking-[0.06em] mb-0.5">{c.title}</div>
                        <p className="text-[0.62rem] leading-[1.75] opacity-55">{c.body}</p>
                      </div>
                    </div>
                  ))
                )}
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
                <div className="text-[0.58rem] opacity-40 tracking-[0.06em]">Get alerted when Flock appears on your council&apos;s agenda</div>
              </div>
              <ExternalLink size={13} className="opacity-30 group-hover:opacity-100 flex-none" />
            </a>
          </div>

          <div>
            <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-4">
              2-minute public comment script
            </div>
            <ScriptBlock label="Read aloud at city council — edit to fit your city" text={SCRIPTS.commentScript} />

            <div className="border border-[#1A1A1A] p-4 mt-3">
              <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-2">After the meeting</div>
              <ul className="space-y-1.5">
                {after.length === 0 ? (
                  <li className="text-[0.65rem] opacity-50">No after-meeting steps published yet.</li>
                ) : (
                  after.map((a) => (
                    <li key={a.id} className="flex gap-2 text-[0.63rem] leading-[1.7] opacity-60">
                      <span className="text-[#C0392B] flex-none">→</span> {a.body}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* 04 — Spread the word */}
      <Section
        step="04"
        icon={Share2}
        title="Spread the Word"
        subtitle="Every person who learns about Flock is a potential organizer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {spread.length === 0 ? (
            <div className="col-span-3 text-[0.7rem] opacity-50">No spread actions published yet.</div>
          ) : (
            (() => {
              // Group spread items by title (the platform name).
              const byPlatform = new Map<string, string[]>();
              for (const s of spread) {
                const list = byPlatform.get(s.title) ?? [];
                list.push(s.body);
                byPlatform.set(s.title, list);
              }
              return Array.from(byPlatform.entries()).map(([platform, actions]) => (
                <div key={platform} className="border border-[#1A1A1A] p-4">
                  <div className="bebas text-[1rem] tracking-[0.02em] mb-3">{platform}</div>
                  <ul className="space-y-2">
                    {actions.map((a, i) => (
                      <li key={i} className="flex gap-2 text-[0.62rem] leading-[1.7] opacity-60">
                        <span className="text-[#C0392B] flex-none mt-0.5">·</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ));
            })()
          )}
        </div>

        <div className="border border-[#1A1A1A] p-4 sm:p-5">
          <div className="text-[0.58rem] tracking-[0.12em] uppercase opacity-40 mb-3">Shareable resources</div>
          <div className="flex flex-wrap gap-3">
            {shareable.length === 0 ? (
              <div className="text-[0.7rem] opacity-50">No resources published yet.</div>
            ) : (
              shareable.map((r) => (
                <a
                  key={r.id}
                  href={r.body}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.08em] uppercase border border-[#1A1A1A] px-3 py-1.5 no-underline opacity-55 hover:opacity-100 hover:border-[#C0392B] hover:text-[#C0392B] transition-all"
                >
                  {r.title} <ExternalLink size={9} />
                </a>
              ))
            )}
          </div>
        </div>
      </Section>

      {/* 05 — Go further */}
      <Section
        step="05"
        icon={Megaphone}
        title="Go Further"
        subtitle="For those ready to escalate — legal action, FOIA requests, legislation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="border border-[#1A1A1A] p-5">
              <div className="bebas text-[1.1rem] tracking-[0.02em] mb-3 flex items-center gap-2">
                <FileText size={15} className="text-[#C0392B]" /> File a FOIA Request
              </div>
              <p className="text-[0.68rem] leading-[1.85] opacity-60 mb-4">
                Request your city&apos;s full Flock Safety contract, data retention policies, and any sharing agreements with other agencies. Many communities discovered their contracts had no data limits or oversight requirements only after filing.
              </p>
              <ScriptBlock label="FOIA request template" text={SCRIPTS.foiaTemplate} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-[#1A1A1A] p-5">
              <div className="bebas text-[1.1rem] tracking-[0.02em] mb-3">Escalation paths</div>
              <div className="space-y-3">
                {escalate.length === 0 ? (
                  <div className="text-[0.7rem] opacity-50">No escalation paths published yet.</div>
                ) : (
                  escalate.map((e) => (
                    <a
                      key={e.id}
                      href={e.body}
                      target={e.body.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="flex items-start justify-between border border-[#1A1A1A] p-3 no-underline hover:border-[#C0392B] transition-all group"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="bebas text-[0.95rem] tracking-[0.02em] group-hover:text-[#C0392B] transition-colors leading-tight mb-1">{e.title}</div>
                      </div>
                      <ExternalLink size={11} className="opacity-25 group-hover:opacity-80 flex-none mt-0.5" />
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Bottom CTA */}
      <div className="border-t-2 border-[#1A1A1A] px-5 sm:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="bebas text-[1.4rem] sm:text-[1.6rem] tracking-[0.02em]">
            ALREADY ORGANIZED? <span className="text-[#C0392B]">GET LISTED.</span>
          </div>
          <div className="text-[0.68rem] opacity-45 tracking-[0.06em] mt-1">
            Add your group to our directory so others in your city can find you.
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
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

function Section({
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
  return (
    <details className="border-b border-[#1A1A1A] group">
      <summary className="px-5 sm:px-8 py-5 flex items-center gap-3 sm:gap-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex-none w-8 h-8 border border-[#1A1A1A] flex items-center justify-center group-open:border-[#C0392B] group-open:bg-[#C0392B] group-open:text-[#F2EDE4] transition-all">
          <span className="bebas text-[0.9rem] leading-none">{step}</span>
        </div>
        <Icon size={18} className="flex-none opacity-30 group-open:text-[#C0392B] group-open:opacity-100 transition-colors" />
        <div className="flex-1 min-w-0">
          <div className="bebas text-[1.3rem] leading-tight tracking-[0.02em] group-hover:text-[#C0392B] group-open:text-[#C0392B] transition-colors">
            {title}
          </div>
          <div className="text-[0.62rem] opacity-40 tracking-[0.06em] mt-0.5">{subtitle}</div>
        </div>
        <ChevronRight size={15} className="flex-none opacity-30 group-open:rotate-90 transition-transform" />
      </summary>
      <div className="px-5 sm:px-8 pb-8 border-t border-[#1A1A1A] pt-6 bg-[#1A1A1A] bg-opacity-[0.015]">
        {children}
      </div>
    </details>
  );
}

function ScriptBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="border border-[#1A1A1A] mb-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1A1A1A] bg-[#1A1A1A] bg-opacity-5">
        <span className="text-[0.55rem] tracking-[0.12em] uppercase opacity-50">{label}</span>
        <CopyButton text={text} />
      </div>
      <p className="px-4 py-3 text-[0.68rem] leading-[1.85] opacity-65 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

import { api } from "../lib/api";
import { IssueRow } from "./issue-row";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function IssuesPage() {
  let issues: Awaited<ReturnType<typeof api.listIssues>> = [];
  let loadError: string | null = null;
  try {
    issues = await api.listIssues();
  } catch (err) {
    loadError = (err as Error).message;
  }

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
          {issues.length > 0
            ? `${issues.length} documented issues with FLOCK Safety's automated license plate reader network — from constitutional concerns to security failures to the total absence of democratic oversight.`
            : "Six documented issues with FLOCK Safety's automated license plate reader network — from constitutional concerns to security failures to the total absence of democratic oversight."}
        </p>
      </div>

      {/* Issues list */}
      {loadError && (
        <div className="px-5 sm:px-8 py-6 border-b border-[#1A1A1A] text-[0.72rem] opacity-50">
          Couldn’t reach the issues service: {loadError}. The page below is empty until the backend is reachable.
        </div>
      )}

      {issues.length === 0 ? (
        <div className="px-5 sm:px-8 py-20 text-center">
          <div className="bebas text-[1.4rem] tracking-[0.02em] mb-2">No issues published yet</div>
          <div className="text-[0.7rem] opacity-50">Check back soon, or seed the database via the backend.</div>
        </div>
      ) : (
        <div>
          {issues.map((issue, i) => (
            <IssueRow
              key={issue.id}
              tag={issue.tag}
              title={issue.title}
              summary={issue.summary}
              body={issue.body}
              sources={issue.sources ?? []}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="border-t-2 border-[#1A1A1A] px-5 sm:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="bebas text-[1.4rem] sm:text-[1.6rem] tracking-[0.02em]">
            READY TO PUSH BACK?
          </div>
          <div className="text-[0.7rem] opacity-50 tracking-[0.08em] mt-1">
            Knowing the problem is step one. Here&apos;s what to do next.
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

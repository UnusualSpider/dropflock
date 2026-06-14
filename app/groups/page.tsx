import { api } from "../lib/api";
import { GroupsBrowser } from "./groups-browser";
import { SubmitGroupButton } from "./submit-group-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GroupsPage() {
  let groups: Awaited<ReturnType<typeof api.listGroups>> = [];
  let loadError: string | null = null;
  try {
    groups = await api.listGroups();
  } catch (err) {
    loadError = (err as Error).message;
  }

  return (
    <main className="flex-1 bg-[#F2EDE4] text-[#1A1A1A] font-mono flex flex-col md:overflow-hidden md:h-[calc(100vh-73px)] min-h-[calc(100vh-73px)]">
      {/* Page header */}
      <div className="border-b-2 border-[#1A1A1A] px-5 sm:px-8 py-7 flex flex-col md:flex-row md:items-end md:justify-between gap-4 flex-none">
        <div>
          <span className="text-[0.6rem] tracking-[0.14em] uppercase border border-[#1A1A1A] px-1.5 py-0.5 inline-block mb-3 opacity-60">
            Find Groups
          </span>
          <h1 className="bebas text-[clamp(1.8rem,3.5vw,3.2rem)] leading-[0.9] tracking-[0.02em]">
            YOU ARE  <span className="text-[#C0392B]">NOT ALONE</span> IN THIS.
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[0.65rem] leading-[1.7] opacity-45 max-w-[260px]">
            30+ localities have canceled Flock contracts since 2025. Organized communities win.
          </p>
          <SubmitGroupButton />
        </div>
      </div>

      {loadError && (
        <div className="border-b border-[#1A1A1A] px-5 sm:px-8 py-3 text-[0.7rem] opacity-50">
          Couldn’t reach the groups service: {loadError}. The directory below is empty until the backend is reachable.
        </div>
      )}

      {groups.length === 0 && !loadError ? (
        <div className="flex-1 flex items-center justify-center text-center opacity-30">
          <div>
            <div className="bebas text-[1.5rem] mb-2">No groups published yet</div>
            <div className="text-[0.7rem]">Be the first — submit your group above.</div>
          </div>
        </div>
      ) : (
        <GroupsBrowser groups={groups} />
      )}
    </main>
  );
}

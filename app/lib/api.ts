// Server-side fetch layer for the DropFlock API.
//
// This module is server-only — it reads `BACKEND_INTERNAL_URL` and
// `ADMIN_TOKEN` from process.env at request time, and is imported only by
// server components and route handlers. It MUST NOT be imported from
// `"use client"` files; the browser would fail to bundle `node:fs` etc.,
// and even if it compiled we don't want the admin token in the JS bundle.
//
// On K8s, BACKEND_INTERNAL_URL points to the in-cluster backend service:
//   http://backend.dropflock.svc.cluster.local:8080
// On a dev laptop, set it to http://localhost:8080 (after starting the
// Go backend with `go run ./cmd` from the backend/ directory).

export type Source = { label: string; href: string };

export type Issue = {
  id: number;
  slug: string;
  tag: string;
  title: string;
  summary: string;
  body: string;
  sources: Source[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: number;
  slug: string;
  name: string;
  scope: "National" | "State" | "Local" | string;
  focus: string[];
  location: string;
  lat?: number | null;
  lng?: number | null;
  url: string;
  win?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Stat = {
  id: number;
  key: string;
  value: string;
  label: string;
  emphasis: "red" | "normal" | string;
  source?: string;
  sort_order: number;
  updated_at: string;
};

export type TalkingPoint = {
  id: number;
  title: string;
  body: string;
  category: string;
  sort_order: number;
};

export type SecurityIncident = {
  id: number;
  title: string;
  date: string | null;
  description: string;
  source_url: string | null;
  flock_denied: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SecurityFinding = {
  id: number;
  slug: string;
  severity: "CRITICAL" | "HIGH" | string;
  device: string;
  title: string;
  body: string;
  source: string;
  source_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Rep = {
  id: number;
  zip_prefix: string;
  level: string;
  name: string;
  role: string;
  contact_url?: string;
  contact_email?: string;
  contact_phone?: string;
};

// API envelope shape — every backend response uses this.
type Envelope<T> = { data: T; error?: string };

// BACKEND_URL is read at request time so the same build can run on
// dev (localhost) and prod (in-cluster Service DNS) without rebuilding.
// ADMIN_TOKEN is server-only; never log or echo it.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function readBackendUrl(): string {
  const v = process.env.BACKEND_INTERNAL_URL;
  if (v && v.length > 0) return v;
  return "http://localhost:8080";
}

async function apiGet<T>(path: string): Promise<T> {
  const url = `${readBackendUrl()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    throw new Error(`Backend unreachable at ${url}: ${(err as Error).message}`);
  }
  if (!res.ok) {
    throw new Error(`Backend ${res.status} on GET ${path}`);
  }
  const json = (await res.json()) as Envelope<T>;
  if (json.error) throw new Error(json.error);
  return json.data;
}

// Reads (public). All of these hit the same-origin /api/* path the
// ingress exposes; the proxy on /api → backend:8080 keeps it server-side.
export const api = {
  listIssues: () => apiGet<Issue[]>("/api/issues"),
  getIssue: (id: number | string) => apiGet<Issue>(`/api/issues/${id}`),
  listGroups: (params?: { scope?: string; focus?: string[]; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.scope) qs.set("scope", params.scope);
    if (params?.focus && params.focus.length > 0) qs.set("focus", params.focus.join(","));
    if (params?.q) qs.set("q", params.q);
    const suffix = qs.toString();
    return apiGet<Group[]>(`/api/groups${suffix ? `?${suffix}` : ""}`);
  },
  getGroup: (id: number | string) => apiGet<Group>(`/api/groups/${id}`),
  listStats: (keys?: string[]) => {
    const suffix = keys && keys.length > 0 ? `?${keys.map((k) => `key=${encodeURIComponent(k)}`).join("&")}` : "";
    return apiGet<Stat[]>(`/api/stats${suffix}`);
  },
  listTalkingPoints: (category?: string) => {
    const suffix = category ? `?category=${encodeURIComponent(category)}` : "";
    return apiGet<TalkingPoint[]>(`/api/talking-points${suffix}`);
  },
  listSecurityIncidents: () => apiGet<SecurityIncident[]>("/api/security/incidents"),
  listSecurityFindings: () => apiGet<SecurityFinding[]>("/api/security/findings"),
  getSecurityFinding: (slug: string) => apiGet<SecurityFinding>(`/api/security/findings/${encodeURIComponent(slug)}`),
  listReps: (zip: string) => apiGet<Rep[]>(`/api/reps?zip=${encodeURIComponent(zip)}`),
};

// Server-side write helper. Only callable from server components or route
// handlers; uses the in-cluster BACKEND_URL directly so we don't depend on
// the Next.js proxy round-trip for internal traffic.
//
// This is exported but currently unused — the public Submit-Group form goes
// through the /api/groups Next.js route handler, which calls this on the
// server side. We export it so future admin tooling (server actions) can
// reuse the same client.
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  if (!ADMIN_TOKEN) {
    throw new Error("ADMIN_TOKEN is not configured on the server");
  }
  const res = await fetch(`${readBackendUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend ${res.status} on POST ${path}: ${text}`);
  }
  const json = (await res.json()) as Envelope<T>;
  if (json.error) throw new Error(json.error);
  return json.data;
}

import { NextRequest, NextResponse } from "next/server";

// Submit-Group form posts here. This route handler:
//   1. Parses the JSON body sent by the browser.
//   2. Forwards it to the in-cluster Go backend with the admin token
//      (read from process.env, never sent to the client).
//   3. Returns the backend's response verbatim — same status, same body.
//
// This is the public write path for /api/groups. All other writes
// (issues, stats, etc.) are admin-only and not currently exposed to
// the browser; they're for future admin tooling.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Best-effort slug from the name; backend will store it but it's optional.
  const slug = slugify(name);
  const payload = {
    slug,
    name,
    scope: typeof body.scope === "string" && body.scope.length > 0 ? body.scope : "Local",
    focus: Array.isArray(body.focus) ? body.focus.filter((x): x is string => typeof x === "string") : [],
    location: typeof body.location === "string" ? body.location : "",
    url: typeof body.url === "string" ? body.url : "",
    email: typeof body.email === "string" ? body.email : "",
    win: typeof body.win === "string" ? body.win : "",
  };

  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Server is missing ADMIN_TOKEN — submissions are disabled." },
      { status: 503 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Backend unreachable: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

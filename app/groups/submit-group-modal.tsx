"use client";

import { useState } from "react";
import { X } from "lucide-react";

const FOCUS_OPTIONS = ["Legal", "Organizing", "Research", "Policy", "Tools"] as const;

export function SubmitGroupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<string>("Local");
  const [focus, setFocus] = useState<string[]>(["Organizing"]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: true } | { ok: false; error: string } | null>(null);

  const toggleFocus = (f: string) => {
    setFocus((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, url, email, scope, focus, win: description }),
      });
      const text = await res.text();
      let parsed: { error?: string } = {};
      try { parsed = JSON.parse(text); } catch { /* ignore */ }
      if (!res.ok) {
        setResult({ ok: false, error: parsed.error ?? `Server returned ${res.status}` });
        return;
      }
      setResult({ ok: true });
      // Close after a short pause so the user sees the success state.
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setResult({ ok: false, error: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#1A1A1A] bg-opacity-80 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        className="bg-[#F2EDE4] border-2 border-[#1A1A1A] max-w-[500px] w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="bebas text-[1.6rem] tracking-[0.02em]">Submit Your Group</div>
            <div className="text-[0.62rem] opacity-40 tracking-[0.06em] mt-0.5">
              We&apos;ll review and add it to the directory.
            </div>
          </div>
          <button type="button" onClick={onClose} className="opacity-30 hover:opacity-70 transition-opacity cursor-pointer mt-1">
            <X size={18} />
          </button>
        </div>

        {result && result.ok && (
          <div className="border border-[#C0392B] text-[#C0392B] px-3 py-2 mb-4 text-[0.7rem]">
            Thanks! Your submission was received and is now in the directory.
          </div>
        )}
        {result && !result.ok && (
          <div className="border border-[#C0392B] bg-[#C0392B] text-[#F2EDE4] px-3 py-2 mb-4 text-[0.7rem]">
            {result.error}
          </div>
        )}

        <div className="space-y-4">
          <Field label="Group name" required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eyes Off Example City"
              className="w-full bg-transparent border border-[#1A1A1A] px-3 py-2.5 text-[0.72rem] outline-none placeholder:opacity-25 focus:border-[#C0392B] transition-colors"
            />
          </Field>

          <Field label="Location">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State (or National)"
              className="w-full bg-transparent border border-[#1A1A1A] px-3 py-2.5 text-[0.72rem] outline-none placeholder:opacity-25 focus:border-[#C0392B] transition-colors"
            />
          </Field>

          <Field label="Scope">
            <div className="flex gap-1.5 flex-wrap">
              {(["National", "State", "Local"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setScope(s)}
                  className={`text-[0.58rem] tracking-[0.1em] uppercase px-2.5 py-1 border transition-all cursor-pointer ${
                    scope === s ? "border-[#C0392B] text-[#C0392B]" : "border-[#1A1A1A] opacity-50 hover:opacity-80"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Focus areas">
            <div className="flex gap-1.5 flex-wrap">
              {FOCUS_OPTIONS.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFocus(f)}
                  className={`text-[0.58rem] tracking-[0.1em] uppercase px-2.5 py-1 border transition-all cursor-pointer ${
                    focus.includes(f) ? "border-[#C0392B] text-[#C0392B]" : "border-[#1A1A1A] opacity-50 hover:opacity-80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Website">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-transparent border border-[#1A1A1A] px-3 py-2.5 text-[0.72rem] outline-none placeholder:opacity-25 focus:border-[#C0392B] transition-colors"
            />
          </Field>

          <Field label="Contact email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organizer@example.org"
              className="w-full bg-transparent border border-[#1A1A1A] px-3 py-2.5 text-[0.72rem] outline-none placeholder:opacity-25 focus:border-[#C0392B] transition-colors"
            />
          </Field>

          <Field label="Brief description">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your group do? What are you fighting?"
              className="w-full bg-transparent border border-[#1A1A1A] px-3 py-2.5 text-[0.72rem] outline-none placeholder:opacity-25 focus:border-[#C0392B] transition-colors resize-none"
            />
          </Field>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex-1 bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-5 py-2.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase no-underline text-center transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit Group"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#1A1A1A] px-5 py-2.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase opacity-40 hover:opacity-80 transition-opacity cursor-pointer bg-transparent"
          >
            Cancel
          </button>
        </div>
        <p className="text-[0.55rem] opacity-30 mt-3 tracking-[0.05em]">
          Submissions appear in the directory immediately. The community flags inappropriate entries for review.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[0.58rem] tracking-[0.12em] uppercase opacity-50 block mb-1.5">
        {label}{required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

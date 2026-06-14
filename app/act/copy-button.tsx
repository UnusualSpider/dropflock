"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-[0.52rem] tracking-[0.1em] uppercase opacity-40 hover:opacity-100 hover:text-[#C0392B] transition-all cursor-pointer bg-transparent border-none"
    >
      {copied ? <Check size={11} className="text-[#C0392B]" /> : <Copy size={11} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

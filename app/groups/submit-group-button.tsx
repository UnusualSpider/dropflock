"use client";

import { useState } from "react";
import { SubmitGroupModal } from "./submit-group-modal";

export function SubmitGroupButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-[#C0392B] text-[#F2EDE4] border border-[#C0392B] px-4 py-2 text-[0.62rem] font-bold tracking-[0.1em] uppercase transition-colors hover:bg-[#F2EDE4] hover:text-[#C0392B] cursor-pointer flex-none"
      >
        + Submit Group
      </button>
      {open && <SubmitGroupModal onClose={() => setOpen(false)} />}
    </>
  );
}

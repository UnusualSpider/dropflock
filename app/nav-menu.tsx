"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export interface NavLink {
  label: string;
  href: string;
}

export default function NavMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="md:hidden flex-none border border-[#1A1A1A] p-2 bg-transparent cursor-pointer text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F2EDE4] transition-colors"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 top-[57px] sm:top-[65px] z-40 bg-[#1A1A1A] bg-opacity-90"
          onClick={() => setOpen(false)}
        >
          <nav
            className="bg-[#F2EDE4] border-b-2 border-[#1A1A1A] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[0.8rem] tracking-[0.1em] uppercase px-6 py-4 border-b border-[#1A1A1A] border-opacity-20 text-[#1A1A1A] no-underline hover:bg-[#1A1A1A] hover:text-[#F2EDE4] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

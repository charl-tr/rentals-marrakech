"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

export default function UserWidget({
  name,
  role,
  initials,
  isDirector,
}: {
  name: string;
  role: string;
  initials: string;
  isDirector: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 focus:outline-none"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-charcoal)] text-[11px] font-medium uppercase text-white">
          {initials}
        </div>
        <div className="hidden leading-tight lg:block text-left">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {name}
            {isDirector && (
              <span className="rounded-full bg-[var(--color-terracotta)] px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-[0.22em] text-white">
                Dir.
              </span>
            )}
          </div>
          <div className="text-[10px] text-[var(--color-stone)]">{role}</div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-beige-warm)] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-[var(--color-charcoal)]">
                {name}
              </div>
              {isDirector && (
                <span className="rounded-full bg-[var(--color-terracotta)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white">
                  Directeur
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--color-stone)]">
              {role}
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-cream)] hover:text-[var(--color-terracotta)]"
            >
              <LogOut size={14} />
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

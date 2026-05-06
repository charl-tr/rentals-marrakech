"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavLink({
  href,
  label,
  mobile = false,
}: {
  href: string;
  label: string;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");

  const base =
    "font-medium uppercase tracking-[0.18em] transition-colors whitespace-nowrap";

  if (mobile) {
    return (
      <Link
        href={href}
        className={`${base} flex-shrink-0 px-5 py-3 text-[11px] ${
          active
            ? "bg-[var(--color-cream)] text-[var(--color-terracotta)]"
            : "text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} px-3 py-1.5 text-[12px] ${
        active
          ? "bg-[var(--color-cream)] text-[var(--color-terracotta)]"
          : "text-[var(--color-charcoal)] hover:bg-[var(--color-cream)] hover:text-[var(--color-terracotta)]"
      }`}
    >
      {label}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminNotifications } from "./AdminNotificationsProvider";

function Badge({ count }: { count: number }) {
  return (
    <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-alert)] px-1 text-[9px] font-semibold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

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
  const { unreadLeads } = useAdminNotifications();
  const active =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");
  const badge = href === "/admin/leads" && unreadLeads > 0 ? unreadLeads : null;

  const base =
    "font-medium uppercase tracking-[0.18em] transition-colors whitespace-nowrap";

  if (mobile) {
    return (
      <Link
        href={href}
        className={`${base} flex flex-shrink-0 items-center px-5 py-3 text-[11px] ${
          active
            ? "bg-[var(--color-cream)] text-[var(--color-terracotta)]"
            : "text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
        }`}
      >
        {label}
        {badge !== null && <Badge count={badge} />}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} flex items-center px-3 py-1.5 text-[12px] ${
        active
          ? "bg-[var(--color-cream)] text-[var(--color-terracotta)]"
          : "text-[var(--color-charcoal)] hover:bg-[var(--color-cream)] hover:text-[var(--color-terracotta)]"
      }`}
    >
      {label}
      {badge !== null && <Badge count={badge} />}
    </Link>
  );
}

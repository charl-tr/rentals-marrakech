import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export default function AdminBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  size={10}
                  className="shrink-0 text-[var(--color-stone)]/40"
                  aria-hidden
                />
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)]"
                      : "text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

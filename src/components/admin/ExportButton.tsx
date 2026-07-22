"use client";

import { Download } from "lucide-react";

export default function ExportButton() {
  return (
    <a
      href="/api/admin/leads/export"
      download
      className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
    >
      <Download size={13} />
      Exporter CSV
    </a>
  );
}

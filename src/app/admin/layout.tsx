import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import AdminNavLink from "@/components/admin/AdminNavLink";
import UserWidget from "@/components/admin/UserWidget";
import CommandPalette from "@/components/admin/CommandPalette";
import CommandPaletteTrigger from "@/components/admin/CommandPaletteTrigger";
import RealtimeSync from "@/components/admin/RealtimeSync";
import { getAdminSession } from "@/lib/auth";
import { getAllAdvisors, getAllLeads, getAllPropertiesAdmin } from "@/lib/db";

export const metadata: Metadata = {
  title: "Administration — Marrakech Realty",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/biens", label: "Biens" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/equipe", label: "Équipe" },
  { href: "/admin/matching", label: "Matching" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Garde de sécurité : si la session est invalide (cookie expiré, email
  // hors whitelist advisors), on redirige vers la page de login. Le proxy
  // couvre déjà le cas "pas de user auth", mais pas le cas "auth OK mais
  // email non whitelisté dans advisors" — d'où cette vérif en layout.
  if (!session) {
    redirect("/admin/login");
  }

  // Data pour le CommandPalette — session garantie non-null après redirect
  const [allLeads, allProperties, allAdvisors] = await Promise.all([
    getAllLeads(),
    getAllPropertiesAdmin(),
    getAllAdvisors(),
  ]);

  const paletteData = {
    leads: allLeads.slice(0, 30).map((l) => ({
      id: l.id,
      name: `${l.buyer.firstName} ${l.buyer.lastName}`.trim(),
      status: l.status,
    })),
    properties: allProperties.slice(0, 30).map((p) => ({
      slug: p.slug,
      title: p.title,
      reference: p.reference,
    })),
    advisors: allAdvisors.map((a) => ({ slug: a.slug, name: a.name })),
  };

  const loggedUser = {
    name: session.advisorName,
    role: session.advisorRole.split("—")[0]?.trim() ?? session.advisorRole,
    initials: session.advisorName
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s[0].toUpperCase())
      .slice(0, 2)
      .join(""),
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-charcoal)]">
      {/* Top nav — dense, utilitaire, full-width */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-beige-warm)] bg-white/95 backdrop-blur-md">
        <div className="flex h-14 items-center gap-6 px-5 md:h-16 md:gap-8 md:px-8">
          {/* Logo compact + label Admin */}
          <Link
            href="/admin"
            className="flex items-center gap-2.5 whitespace-nowrap"
          >
            <Image
              src="/logo-original.png"
              alt="Marrakech Realty"
              width={40}
              height={40}
              className="h-7 w-7 object-contain"
              priority
            />
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)] sm:inline">
              Admin
            </span>
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <AdminNavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Zone droite : search + retour + user */}
          <div className="flex items-center gap-3 whitespace-nowrap">
            {/* Cmd-K trigger */}
            <CommandPaletteTrigger />

            {/* Retour au site */}
            <Link
              href="/"
              title="Retour au site public"
              aria-label="Retour au site public"
              className="hidden h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--color-beige-warm)] text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)] hover:text-[var(--color-charcoal)] md:inline-flex"
            >
              <ArrowUpRight size={14} />
            </Link>

            {/* User widget (dropdown signout) */}
            <UserWidget
              name={loggedUser.name}
              role={loggedUser.role}
              initials={loggedUser.initials}
              isDirector={session.role === "director"}
            />
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex overflow-x-auto border-t border-[var(--color-beige-warm)] bg-white md:hidden">
          {NAV.map((item) => (
            <AdminNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              mobile
            />
          ))}
        </nav>
      </header>

      <main>{children}</main>

      {/* Command palette global — écoute cmd+K */}
      <CommandPalette data={paletteData} />

      {/* Sync Realtime — silent, refresh RSC sur DB changes */}
      <RealtimeSync />
    </div>
  );
}

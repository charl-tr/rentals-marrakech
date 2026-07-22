import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    // AVIF en priorité (≈20-30% plus léger que le WebP), fallback WebP.
    // Allège toutes les images optimisées (fiches, galerie, hero) sans
    // retoucher les sources.
    formats: ["image/avif", "image/webp"],
    // Cache long des variantes optimisées → évite de ré-optimiser à chaque
    // fois (moins de latence sur les hits froids). 31 jours.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      // Photos MR (Wayback-scraped, hébergées sur WP)
      { protocol: "https", hostname: "www.marrakechrealty.com" },
      // Supabase Storage public bucket
      { protocol: "https", hostname: "bjdcdtwfqlmvwxkrfklt.supabase.co" },
    ],
  },

  // Préservation du SEO marrakechrealty.com → 308 Permanent Redirect
  // (Next.js utilise 308 au lieu de 301 — équivalent SEO + préserve la méthode HTTP)
  async redirects() {
    return [
      // ── Taxonomies vente — geo-segmentées par quartier ────────────
      { source: "/vente-villa-a-la-palmeraie-a-marrakech", destination: "/acheter/villa/palmeraie", permanent: true },
      { source: "/vente-villa-quartier-hivernage-a-marrakech", destination: "/acheter/villa/hivernage", permanent: true },
      { source: "/vente-villa-a-targa-marrakech", destination: "/acheter/villa/targa", permanent: true },
      { source: "/vente-villa-a-amelkis-marrakech", destination: "/acheter/villa/amelkis", permanent: true },
      { source: "/vente-villa-a-gueliz-marrakech", destination: "/acheter/villa/gueliz", permanent: true },
      { source: "/vente-villa-route-de-lourika-marrakech", destination: "/acheter/villa/ourika", permanent: true },
      { source: "/vente-villa-route-de-fes-marrakech", destination: "/acheter/villa/fes", permanent: true },
      { source: "/vente-villa-route-de-ouarzazate-marrakech", destination: "/acheter/villa/ouarzazate", permanent: true },
      { source: "/vente-villa-route-damizmiz-a-marrakech", destination: "/acheter/villa/amizmiz", permanent: true },

      // ── Taxonomies vente — par type ────────────────────────────────
      { source: "/vente-villa", destination: "/acheter/villa", permanent: true },
      { source: "/vente-riad-renove", destination: "/acheter/riad-renove", permanent: true },
      { source: "/vente-riad-a-renover", destination: "/acheter/riad-a-renover", permanent: true },
      { source: "/vente-appartement", destination: "/acheter/appartement", permanent: true },
      { source: "/vente-terrain", destination: "/acheter/terrain", permanent: true },
      { source: "/programmes-neufs", destination: "/acheter/programmes-neufs", permanent: true },

      // ── Taxonomies location ────────────────────────────────────────
      { source: "/location-villa", destination: "/louer/villa", permanent: true },
      { source: "/location-appartement", destination: "/louer/appartement", permanent: true },
      { source: "/locations-saisonnieres", destination: "/louer/saisonnier", permanent: true },

      // ── Fiches bien (slug préservé) ────────────────────────────────
      { source: "/vente/:slug", destination: "/acheter/:slug", permanent: true },
      { source: "/location/:slug", destination: "/louer/:slug", permanent: true },
      { source: "/programme/:slug", destination: "/acheter/:slug", permanent: true },

      // ── Essaouira (sous-section conservée) ─────────────────────────
      // Les pages /essaouira/* restent à leur place — pas de redirect.
      // (À vérifier au cas par cas une fois les pages créées.)

      // ── Infos utiles → guide /savoir-acheter structuré ─────────────
      { source: "/info", destination: "/savoir-acheter", permanent: true },
      // Note : les ancres #melkia, #titre-foncier, etc. ne peuvent pas être
      // redirigées côté serveur (le navigateur ne les envoie pas). Les liens
      // entrants vers /info/#melkia atterriront sur /savoir-acheter et un script
      // côté client devra mapper le hash vers /savoir-acheter/melkia. À traiter
      // dans la page /savoir-acheter elle-même.

      // ── Pages utilitaires ──────────────────────────────────────────
      { source: "/recherche", destination: "/acheter", permanent: true },
      { source: "/blog", destination: "/journal", permanent: true },
      { source: "/blog/:slug", destination: "/journal/:slug", permanent: true },
      // ── i18n EN — placeholder en attendant l'i18n complète ─────────
      { source: "/en", destination: "/", permanent: false },
      { source: "/en/:path*", destination: "/", permanent: false },
      // Note : /deposer-un-bien et /mentions-legales gardent leur slug —
      // donc pas de redirect (sinon 308 sur soi-même = boucle infinie).
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Silence Sentry build output — on ne veut pas polluer les logs de build
  silent: true,
  // Désactive le source map upload si pas de SENTRY_AUTH_TOKEN
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Pas de tunnel en dev — évite des requêtes inutiles
  disableLogger: true,
  automaticVercelMonitors: false,
});

import Link from "next/link";
import { notFound } from "next/navigation";
import { journalArticles, journalDate } from "@/data/verified-journal";
import { languagePath } from "@/lib/i18n/routes";
import SectionHero from "@/components/SectionHero";

export default function JournalArticlePage({ slug, locale = "fr" }: { slug: string; locale?: "fr" | "en" }) {
  const en = locale === "en";
  const article = journalArticles(locale).find(a => a.slug === slug);
  if (!article) notFound();
  return <>
    <SectionHero locale={locale} eyebrow={en ? "Journal · Archive" : "Journal · Archive"}
      title={article.title} backHref={languagePath("/journal", locale)} backLabel={en ? "Back to journal" : "Retour au journal"} />
    <article className="container-luxe py-10 md:py-14">
      <div className="max-w-2xl">
        <p className="text-sm text-[var(--color-stone)]">{en ? "Original source: Marrakech Realty · " : "Source originale : Marrakech Realty · "}<time dateTime={article.publishedAt}>{journalDate(article.publishedAt, locale)}</time></p>
        <h2 className="mt-6 font-serif text-3xl">{en ? "About this reading" : "À propos de cette lecture"}</h2>
        <p className="mt-4 text-lg leading-relaxed">{article.lead}</p>
        <p className="mt-6 rounded-2xl bg-[var(--color-beige)] p-5 text-sm leading-relaxed">{en ? "This is a reading note, not a full translation or updated legal advice. The original article dates from 2020. Check current requirements with your notary before making a decision." : "Il s’agit d’une note de lecture, pas d’un article actualisé ni d’un conseil juridique. Le texte original date de 2020. Faites confirmer les règles actuelles par votre notaire avant toute décision."}</p>
        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mt-6 inline-flex">{en ? "Read original in French ↗" : "Lire l’article original ↗"}<span className="sr-only">{en ? " (new tab)" : " (nouvel onglet)"}</span></a>
        <div className="mt-10 border-t border-[var(--color-border)] pt-6"><Link href={languagePath("/contact", locale)} className="text-[var(--color-terracotta)] underline underline-offset-4">{en ? "Discuss your property project with the team" : "Échanger avec l’équipe sur votre projet immobilier"}</Link></div>
      </div>
    </article>
  </>;
}

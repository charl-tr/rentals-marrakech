import Link from "next/link";
import { ArrowUpRight, ArrowRight, BookOpen } from "lucide-react";
import { languagePath } from "@/lib/i18n/routes";
import { journalArticles, journalDate } from "@/data/verified-journal";
import SectionHero from "@/components/SectionHero";

export default function JournalPage({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const articles = journalArticles(locale);
  return <>
    <SectionHero locale={locale} showBack={false}
      eyebrow={en ? "Journal · Buying in Morocco" : "Journal · Acheter au Maroc"}
      title={en ? "A clearer view of your project." : "Des repères pour votre projet."}
      subtitle={en ? "Purchase costs, paperwork, buying from abroad. A selection of practical reading from the agency’s original blog." : "Frais d’achat, démarches, achat depuis l’étranger. Une sélection de lectures pratiques issues du blog original de l’agence."}
    />
    <section className="bg-[var(--color-cream)] py-8 md:py-12">
      <div className="container-luxe">
        <div className="mb-8 flex max-w-3xl items-start gap-3 text-sm leading-relaxed text-[var(--color-stone)]">
          <BookOpen size={20} className="mt-0.5 shrink-0 text-[var(--color-terracotta)]" aria-hidden />
          <p>{en ? "From the archives · Originally published in June 2020. These reading notes link to the original French articles. Regulations and tax rates may have changed; confirm current requirements with your notary." : "Les archives · Articles publiés en juin 2020. Ces notes de lecture renvoient aux textes originaux. La réglementation et les taux ont pu évoluer : faites confirmer les règles actuelles par votre notaire."}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map(a => <a key={a.slug} href={a.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:border-[var(--color-terracotta)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-terracotta)] md:p-8">
            <span className="text-xs font-medium text-[var(--color-terracotta)]">{a.category}</span>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-[var(--color-charcoal)]">{a.title}</h2>
            <p className="mt-4 flex-1 text-sm leading-7 text-[var(--color-stone)]">{a.lead}</p>
            <time dateTime={a.publishedAt} className="mt-6 text-xs text-[var(--color-stone)]">{journalDate(a.publishedAt, locale)}</time>
            <span className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-4 text-sm font-medium text-[var(--color-terracotta)]">
              {en ? "Read original · French" : "Lire l’article original"} <ArrowUpRight size={18} aria-hidden />
            </span>
            <span className="sr-only">{en ? "Opens in a new tab" : "S’ouvre dans un nouvel onglet"}</span>
          </a>)}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl bg-[var(--color-beige)] p-6 md:flex-row md:items-center md:p-8">
          <div>
            <h2 className="font-serif text-3xl">{en ? "Let’s talk about your next step." : "Parlons de votre prochaine étape."}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-stone)]">{en ? "Share your criteria and questions with the team to prepare your property search." : "Partagez vos critères et vos questions avec l’équipe pour préparer votre recherche."}</p>
          </div>
          <Link href={languagePath("/contact", locale)} className="btn-gold inline-flex shrink-0 items-center gap-3">{en ? "Discuss my project" : "Parler de mon projet"}<ArrowRight size={16} aria-hidden /></Link>
        </div>
      </div>
    </section>
  </>;
}

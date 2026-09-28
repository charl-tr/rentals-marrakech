import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { languagePath } from "@/lib/i18n/routes";
import OriginalEditorialNotice from "@/components/OriginalEditorialNotice";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAllArticles, getArticle } from "@/lib/db";

const formatDate = (iso: string, locale: "fr" | "en") =>
 new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
 day: "numeric",
 month: "long",
 year: "numeric",
 }).format(new Date(iso));

// Render markdown-light: paragraphs starting with **bold** at start get formatted
function renderParagraph(p: string, i: number) {
 const m = p.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
 if (m) {
 return (
 <p key={i}>
 <strong className="text-[var(--color-charcoal)]">{m[1]}</strong> {m[2]}
 </p>
 );
 }
 return <p key={i}>{p}</p>;
}

export default async function JournalArticlePage({ slug, locale = "fr" }: { slug: string; locale?: "fr" | "en" }) {
 const en = locale === "en";
 const a = await getArticle(slug);
 if (!a) notFound();

 const articles = await getAllArticles();
 const others = articles.filter((x) => x.slug !== a.slug).slice(0, 2);

 return (
 <article>
 {/* Hero */}
 <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden bg-[var(--color-charcoal)]">
 <Image
 src={a.imageHero}
 alt={a.title}
 fill
 priority
 sizes="100vw"
 className="object-cover"
 />
 <div className="absolute inset-0 hero-overlay-bottom" />
 <div className="container-luxe relative z-10 flex h-full flex-col justify-between pb-20 pt-[112px]">
 <Breadcrumbs locale={locale}
 variant="dark"
 items={[
 { label: en ? "Home" : "Accueil", href: languagePath("/", locale) },
 { label: "Journal", href: languagePath("/journal", locale) },
 { label: a.category },
 ]}
 />
 <div className="max-w-3xl">
 <div className="hero-text-soft eyebrow-light">
 {a.category}
 </div>
 <h1 lang="fr" className="hero-text mt-4 font-serif text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl">
 {a.title}
 </h1>
 <div className="mt-6 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-white/90">
 <span>{a.author}</span>
 <span>·</span>
 <span>{formatDate(a.publishedAt, locale)}</span>
 <span>·</span>
 <span>{a.readingTime} {en ? "min read" : "min de lecture"}</span>
 </div>
 </div>
 </div>
 </section>

 <OriginalEditorialNotice locale={locale} href={`/journal/${slug}`} />
 {/* Body */}
 <section className="bg-white py-24">
 <div className="container-luxe">
 <div className="mx-auto max-w-2xl">
 <p lang="fr" className="font-serif text-2xl leading-relaxed text-[var(--color-charcoal)] md:text-3xl">
 {a.lead}
 </p>
 <div className="my-12 h-px w-16 bg-[var(--color-terracotta)]" />
 <div lang="fr" className="space-y-7 text-lg leading-relaxed text-[var(--color-ink)]">
 {a.paragraphs.map((p, i) => renderParagraph(p, i))}
 </div>

 <div className="mt-16 border-t border-[var(--color-beige-warm)] pt-8 text-sm text-[var(--color-stone)]">
 {en ? "Written by" : "Article rédigé par"} <span className="font-medium text-[var(--color-charcoal)]">{a.author}</span>
 {" — "}
 <Link href={languagePath("/equipe", locale)} className="text-[var(--color-terracotta)] hover:underline">
 {en ? "View profile" : "voir le profil"}
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* Suite éditoriale */}
 {others.length > 0 && (
 <section className="bg-[var(--color-cream)] py-20">
 <div className="container-luxe">
 <div className="text-center">
 <div className="eyebrow">{en ? "Read next" : "Lire ensuite"}</div>
 <h2 className="mt-3 font-serif text-3xl text-[var(--color-charcoal)]">
 {en ? "More articles." : "Autres articles."}
 </h2>
 </div>
 <div className="mt-12 grid gap-12 md:grid-cols-2">
 {others.map((o) => (
 <Link key={o.slug} href={languagePath(`/journal/${o.slug}`, locale)} className="group block">
 <div className="relative aspect-[3/2] overflow-hidden rounded-[14px] bg-[var(--color-charcoal)]">
 <Image
 src={o.imageHero}
 alt={o.title}
 fill
 sizes="(max-width: 768px) 100vw, 50vw"
 className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
 />
 </div>
 <div className="mt-5">
 <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
 {o.category}
 </div>
 <h3 className="mt-3 font-serif text-2xl text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)] transition-colors">
 {o.title}
 </h3>
 <p className="mt-2 text-sm text-[var(--color-stone)]">{o.lead}</p>
 <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
 {en ? "Read" : "Lire"} <ArrowRight size={12} />
 </span>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 )}
 </article>
 );
}

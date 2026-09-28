import type { Metadata } from "next";
import { getAllArticles, getArticle } from "@/lib/db";
import Content from "@/components/JournalArticleContent";
export async function generateStaticParams() {
 const articles = await getAllArticles();
 return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 const { slug } = await params;
 const a = await getArticle(slug);
 if (!a) return { title: "Article introuvable — Marrakech Realty" };
 return {
 title: `${a.title} — Journal · Marrakech Realty`,
 description: a.lead,
 alternates: { canonical: `/journal/${a.slug}` },
 openGraph: { title: a.title, description: a.lead, images: [a.imageHero] },
 };
}


export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 return <Content slug={slug} />;
}

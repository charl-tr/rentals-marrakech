import type { Metadata } from "next";
import { getEditorializedNeighborhoods, getNeighborhood } from "@/lib/db";
import Content from "@/components/AreaPageContent";
export async function generateStaticParams() {
 const all = await getEditorializedNeighborhoods();
 return all.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 const { slug } = await params;
 const q = await getNeighborhood(slug);
 if (!q || !q.tagline) return { title: "Quartier introuvable — Marrakech Realty" };
 return {
 title: `${q.name}, ${q.city} — Quartier · Marrakech Realty`,
 description: q.tagline,
 alternates: { canonical: `/quartiers/${q.slug}` },
 openGraph: { title: q.name, description: q.tagline, images: [q.imageHero] },
 };
}


export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 return <Content slug={slug} />;
}

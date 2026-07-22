import type { Metadata } from "next";
import SectionHero from "@/components/SectionHero";
import MoroccoFeesCalculator from "@/components/MoroccoFeesCalculator";

export const metadata: Metadata = {
  title: "Calculette frais d'acquisition Maroc — Marrakech Realty",
  description:
    "Calculez instantanément les frais d'acquisition d'un bien au Maroc : droits d'enregistrement, conservation foncière, taxe notariale, honoraires. Barème 2026.",
  alternates: { canonical: "/savoir-acheter/calculette" },
};

export default function CalculettePage() {
  return (
    <>
      <SectionHero
        eyebrow="Outil — Frais d'acquisition"
        title={
          <>
            Combien vraiment ?<br />
            <span className="italic text-[var(--color-accent-light)]">
              Le vrai coût d&apos;un achat au Maroc.
            </span>
          </>
        }
        subtitle="Les 6 à 8 % de frais qui se cachent rarement dans les premières conversations — rendus transparents ici."
      />

      <section className="bg-[var(--color-cream)] py-16 md:py-24">
        <div className="container-luxe max-w-3xl">
          <MoroccoFeesCalculator />
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-luxe max-w-3xl">
          <div className="eyebrow">Pour aller plus loin</div>
          <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
            Comprendre chaque ligne.
          </h2>

          <div className="mt-10 space-y-8">
            <article>
              <h3 className="font-serif text-xl text-[var(--color-charcoal)]">
                Droits d&apos;enregistrement
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">
                Taxe prélevée par l&apos;État marocain à l&apos;occasion de la
                mutation. Son taux dépend de la nature du bien : 4 % pour un
                bien ancien (occasion), 5 % pour un bien neuf acquis
                directement auprès d&apos;un promoteur. La base est le prix
                déclaré dans l&apos;acte authentique — déclarer en dessous du
                prix réel expose à un redressement fiscal sérieux.
              </p>
            </article>

            <article>
              <h3 className="font-serif text-xl text-[var(--color-charcoal)]">
                Conservation foncière
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">
                Le service de la Conservation Foncière inscrit officiellement
                la mutation dans les livres fonciers — c&apos;est ce qui rend
                votre propriété opposable aux tiers. Frais calculés à 1 % du
                prix, plus un droit fixe de 150 DH pour les formalités
                administratives.
              </p>
            </article>

            <article>
              <h3 className="font-serif text-xl text-[var(--color-charcoal)]">
                Taxe notariale et honoraires
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">
                Le notaire est l&apos;officier public qui authentifie l&apos;acte
                et garantit la régularité de la transaction. Taxe notariale de
                0,5 % + honoraires qui suivent un barème légal — environ 1 % en
                moyenne, dégressif sur les tranches supérieures. C&apos;est lui
                qui se charge du versement des taxes pour le compte de
                l&apos;acquéreur.
              </p>
            </article>

            <article>
              <h3 className="font-serif text-xl text-[var(--color-charcoal)]">
                Si vous êtes non-résident
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">
                Les étrangers acquéreurs d&apos;un bien au Maroc bénéficient
                des mêmes taux que les résidents pour l&apos;acquisition. Les
                différences apparaissent à la revente : impôt sur la
                plus-value (20 %), avec un mécanisme d&apos;abattement dès 5
                ans de détention et une exonération totale après 10 ans. Le
                rapatriement des fonds à l&apos;étranger passe par une
                déclaration à l&apos;Office des Changes.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import SectionHero from "@/components/SectionHero";

export const metadata: Metadata = {
  title: "Mentions légales — Marrakech Realty",
  description:
    "Informations légales, éditeur du site, hébergement, propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
};

// Copy basé sur la version réelle marrakechrealty.com/mentions-legales/
// (vérifié via Wayback Machine au 2026-04-17)
export default function MentionsLegalesPage() {
  return (
    <>
      <SectionHero
        eyebrow="Informations"
        title="Mentions légales"
        backHref="/"
      />

      <section className="bg-white py-20">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl space-y-12 leading-relaxed text-[var(--color-ink)]">
            <div>
              <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
                Le site web est la propriété de Marrakech Realty
              </h2>
              <p className="mt-4">
                Registre du Commerce n°48293<br />
                Patente n°45192750
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
                Création et développement du site
              </h2>
              <p className="mt-4">
                Par Viaprestige Agency<br />
                39A Rue Mohmed El Beqal (Résidence Espace Guéliz App. N°21)<br />
                40 000 Marrakech — Maroc<br />
                +212 (0) 9 72 675 440
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
                Hébergement
              </h2>
              <p className="mt-4">
                L&apos;hébergement du site est assuré par la société OVH.<br />
                2 rue Kellermann — 59100 Roubaix — France<br />
                +33 9 72 10 10 07
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
                Vie privée
              </h2>
              <p className="mt-4">
                D&apos;une façon générale, vous pouvez visiter librement et
                anonymement notre site sur Internet. Cependant, vous pourrez
                être amené parfois à nous donner des informations à travers un
                formulaire. Par exemple, pour établir un devis, ou pour une
                demande d&apos;information.
              </p>
              <p className="mt-4">
                Vous pouvez demander à ce que nous supprimions les informations
                vous concernant par simple e-mail à{" "}
                <a
                  href="mailto:contact@marrakechrealty.com"
                  className="text-[var(--color-terracotta)] hover:underline"
                >
                  contact@marrakechrealty.com
                </a>
                .
              </p>
              <p className="mt-4">
                Marrakech Realty s&apos;engage à ne pas céder en aucun cas
                (vendre, échanger, louer, donner, prêter) à des tiers les
                informations vous concernant.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
                Droit de reproduction
              </h2>
              <p className="mt-4">
                L&apos;ensemble de ce site relève des législations française et
                internationale sur le droit d&apos;auteur et la propriété
                intellectuelle. Tous les droits de reproduction sont réservés
                pour les documents textes, iconographiques, photographiques et
                vidéos.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
                Contact
              </h2>
              <p className="mt-4">
                E-mail :{" "}
                <a
                  href="mailto:contact@marrakechrealty.com"
                  className="text-[var(--color-terracotta)] hover:underline"
                >
                  contact@marrakechrealty.com
                </a>
                <br />
                Téléphone : +212 (0) 524 380 918 / +212 (0) 661 082 042
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

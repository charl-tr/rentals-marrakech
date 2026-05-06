import Link from "next/link";
import type { Metadata } from "next";
import SectionHero from "@/components/SectionHero";

export const metadata: Metadata = {
  title: "Confidentialité — Marrakech Realty",
  description:
    "Notre engagement sur la confidentialité de vos données, tel qu'indiqué dans nos mentions légales.",
  alternates: { canonical: "/politique-confidentialite" },
};

/**
 * NOTE ÉDITORIALE : cette page reprend la section "Vie privée" des mentions
 * légales réelles de marrakechrealty.com. Un document RGPD complet (finalités
 * détaillées, sous-traitants, durées de conservation, droits étendus) devra
 * être rédigé par un juriste DPO avant la mise en production.
 */
export default function ConfidentialitePage() {
  return (
    <>
      <SectionHero
        eyebrow="Vos données personnelles"
        title="Confidentialité."
        subtitle="Notre engagement simple : vous laisser visiter notre site anonymement, ne céder vos informations à personne, et vous permettre de les effacer sur simple demande."
        backHref="/"
      />

      <section className="bg-white py-20">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl space-y-12 leading-relaxed text-[var(--color-ink)]">
            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Visite anonyme par défaut
              </h2>
              <p className="mt-4">
                D&apos;une façon générale, vous pouvez visiter librement et
                anonymement notre site sur Internet. Aucun compte, aucun
                tracking intrusif. Vous pourrez être amené parfois à nous donner
                des informations à travers un formulaire — pour établir un
                devis, demander une estimation, ou organiser une visite.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Ce que vous pouvez demander
              </h2>
              <p className="mt-4">
                Vous pouvez demander à ce que nous supprimions les informations
                vous concernant par simple e-mail à{" "}
                <a
                  href="mailto:contact@marrakechrealty.com"
                  className="text-[var(--color-terracotta)] hover:underline"
                >
                  contact@marrakechrealty.com
                </a>
                . Nous traitons ces demandes sous 30 jours.
              </p>
              <p className="mt-4">
                Conformément à la loi marocaine 09-08 et au RGPD pour les
                résidents européens, vous disposez également d&apos;un droit
                d&apos;accès, de rectification, de portabilité et
                d&apos;opposition.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl text-[var(--color-charcoal)]">
                Notre engagement
              </h2>
              <p className="mt-4">
                Marrakech Realty s&apos;engage à ne pas céder en aucun cas
                (vendre, échanger, louer, donner, prêter) à des tiers les
                informations vous concernant.
              </p>
            </div>

            <div className="border-t border-[var(--color-beige-warm)] pt-10">
              <p className="text-sm text-[var(--color-stone)]">
                Pour plus de détails sur l&apos;éditeur du site et
                l&apos;hébergement, consultez nos{" "}
                <Link
                  href="/mentions-legales"
                  className="text-[var(--color-terracotta)] hover:underline"
                >
                  mentions légales
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

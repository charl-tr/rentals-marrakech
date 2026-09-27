import type { Metadata } from "next";
import Link from "next/link";
import SellerContactForm from "@/components/SellerContactForm";

export const metadata: Metadata = {
  title: "Vendre votre bien à Marrakech ou Essaouira — Marrakech Realty",
  description: "Vous souhaitez vendre une villa, un riad, un appartement ou un terrain ? Présentez votre projet à Marrakech Realty. Un premier échange sans publication automatique.",
  alternates: { canonical: "/deposer-un-bien" },
};

const STEPS = [
  ["Parlons de votre projet", "Localisation, caractéristiques, calendrier : vous précisez ce que vous savez. Le reste se complète avec votre conseiller."],
  ["Préparons la mise en vente", "Échangez sur le prix, les documents et les conditions du mandat avant de décider de confier votre bien."],
  ["Validons la présentation", "Photos, descriptif et conditions de diffusion sont à définir avec l’agence. Une demande de contact n’est pas une annonce en ligne."],
];

export default function DeposerPage() {
  return <>
    <section className="bg-[var(--color-cream)] pb-12 pt-24 md:pb-16 md:pt-28">
      <div className="container-luxe">
        <nav aria-label="Fil d’Ariane" className="mb-7 text-xs text-[var(--color-stone)]"><Link href="/" className="underline underline-offset-4">Accueil</Link><span aria-hidden="true"> / </span><span>Vendre mon bien</span></nav>
        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">Propriétaires · Marrakech & Essaouira</p>
            <h1 className="mt-4 max-w-xl font-serif text-4xl leading-[1.08] md:text-5xl">Votre prochain projet commence par la vente de votre bien.</h1>
            <p className="mt-5 max-w-lg leading-relaxed text-[var(--color-stone)]">Un riad, une villa, un appartement ou un terrain à vendre ? Faites le premier pas : présentez votre projet, puis décidez de la suite avec l’agence.</p>
            <ul className="mt-6 space-y-3 text-sm"><li>✓ Sans compte à créer</li><li>✓ Aucun mandat signé par ce formulaire</li><li>✓ Vous gardez la main avant toute publication</li></ul>
            <a href="#projet" className="btn-gold mt-7 lg:hidden">Présenter mon bien</a>
            <p className="mt-8 text-sm text-[var(--color-stone)]">Vous préférez en parler ?</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-[var(--color-accent-deep)]"><a href="tel:+212660629444" className="underline underline-offset-4">Appeler l’agence</a><a href="https://wa.me/212660629444?text=Bonjour%2C%20je%20souhaite%20vendre%20mon%20bien.%20Pouvons-nous%20en%20parler%20%3F" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Écrire sur WhatsApp ↗</a></div>
          </div>
          <div id="projet" className="scroll-mt-24"><SellerContactForm /></div>
        </div>
      </div>
    </section>
    <section className="bg-white py-12 md:py-16"><div className="container-luxe">
      <h2 className="font-serif text-3xl">Et après votre demande ?</h2>
      <div className="mt-7 grid gap-5 md:grid-cols-3">{STEPS.map(([title,text],i)=><div key={title} className="rounded-2xl border border-[var(--color-border)] p-6"><span className="text-sm text-[var(--color-accent)]">0{i+1}</span><h3 className="mt-3 font-serif text-2xl">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">{text}</p></div>)}</div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[var(--color-cream)] p-6"><div><h2 className="font-serif text-2xl">Pas encore toutes les informations ?</h2><p className="mt-2 text-sm text-[var(--color-stone)]">Ni photos, ni prix définitif, ni documents ne sont nécessaires pour prendre contact.</p></div><a href="#projet" className="btn-gold">Parler de mon projet</a></div>
    </div></section>
  </>;
}

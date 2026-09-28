
import Link from "next/link";
import SellerContactForm from "@/components/SellerContactForm";



const STEPS = [
  ["Parlons de votre projet", "Localisation, caractéristiques, calendrier : vous précisez ce que vous savez. Le reste se complète avec votre conseiller."],
  ["Préparons la mise en vente", "Échangez sur le prix, les documents et les conditions du mandat avant de décider de confier votre bien."],
  ["Validons la présentation", "Photos, descriptif et conditions de diffusion sont à définir avec l’agence. Une demande de contact n’est pas une annonce en ligne."],
];

export default function SellerPageContent({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const copy: Record<string, string> = {"Parlons de votre projet":"Let’s discuss your plans","Localisation, caractéristiques, calendrier : vous précisez ce que vous savez. Le reste se complète avec votre conseiller.":"Location, details and timing: share what you know. Your advisor will help with the rest.","Préparons la mise en vente":"Prepare your property for sale","Échangez sur le prix, les documents et les conditions du mandat avant de décider de confier votre bien.":"Discuss pricing, documents and the agency agreement before deciding to proceed.","Validons la présentation":"Approve the presentation","Photos, descriptif et conditions de diffusion sont à définir avec l’agence. Une demande de contact n’est pas une annonce en ligne.":"Agree on photos, the description and advertising with the agency. This enquiry does not publish a listing.","Accueil":"Home","Vendre mon bien":"Sell my property","Propriétaires · Marrakech & Essaouira":"Property owners · Marrakech & Essaouira","Votre prochain projet commence par la vente de votre bien.":"Your next chapter starts with selling your property.","Un riad, une villa, un appartement ou un terrain à vendre ? Faites le premier pas : présentez votre projet, puis décidez de la suite avec l’agence.":"Selling a riad, villa, apartment or land? Take the first step: tell us about your plans, then decide how to proceed with the agency.","✓ Sans compte à créer":"✓ No account needed","✓ Aucun mandat signé par ce formulaire":"✓ This form does not sign an agency agreement","✓ Vous gardez la main avant toute publication":"✓ You stay in control before any publication","Présenter mon bien":"Tell us about your property","Vous préférez en parler ?":"Prefer to talk?","Appeler l’agence":"Call the agency","Écrire sur WhatsApp ↗":"Message us on WhatsApp ↗","Et après votre demande ?":"What happens next?","Pas encore toutes les informations ?":"Don’t have all the details yet?","Ni photos, ni prix définitif, ni documents ne sont nécessaires pour prendre contact.":"You don’t need photos, a final price or documents to get in touch.","Parler de mon projet":"Discuss my plans"};
  const t = (value: string) => en ? copy[value] ?? value : value;
  return <>
    <section className="bg-[var(--color-cream)] pb-12 pt-24 md:pb-16 md:pt-28">
      <div className="container-luxe">
        <nav aria-label={en ? "Breadcrumb" : "Fil d’Ariane"} className="mb-7 text-xs text-[var(--color-stone)]"><Link href={en ? "/en" : "/"} className="underline underline-offset-4">{t("Accueil")}</Link><span aria-hidden="true"> / </span><span>{t("Vendre mon bien")}</span></nav>
        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">{t("Propriétaires · Marrakech & Essaouira")}</p>
            <h1 className="mt-4 max-w-xl font-serif text-4xl leading-[1.08] md:text-5xl">{t("Votre prochain projet commence par la vente de votre bien.")}</h1>
            <p className="mt-5 max-w-lg leading-relaxed text-[var(--color-stone)]">{t("Un riad, une villa, un appartement ou un terrain à vendre ? Faites le premier pas : présentez votre projet, puis décidez de la suite avec l’agence.")}</p>
            <ul className="mt-6 space-y-3 text-sm"><li>{t("✓ Sans compte à créer")}</li><li>{t("✓ Aucun mandat signé par ce formulaire")}</li><li>{t("✓ Vous gardez la main avant toute publication")}</li></ul>
            <a href="#projet" className="btn-gold mt-7 lg:hidden">{t("Présenter mon bien")}</a>
            <p className="mt-8 text-sm text-[var(--color-stone)]">{t("Vous préférez en parler ?")}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-[var(--color-accent-deep)]"><a href="tel:+212660629444" className="underline underline-offset-4">{t("Appeler l’agence")}</a><a href={`https://wa.me/212660629444?text=${encodeURIComponent(en ? "Hello, I would like to sell my property. Can we discuss it?" : "Bonjour, je souhaite vendre mon bien. Pouvons-nous en parler ?")}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{t("Écrire sur WhatsApp ↗")}</a></div>
          </div>
          <div id="projet" className="scroll-mt-24"><SellerContactForm locale={locale} /></div>
        </div>
      </div>
    </section>
    <section className="bg-white py-12 md:py-16"><div className="container-luxe">
      <h2 className="font-serif text-3xl">{t("Et après votre demande ?")}</h2>
      <div className="mt-7 grid gap-5 md:grid-cols-3">{STEPS.map(([title,text],i)=><div key={title} className="rounded-2xl border border-[var(--color-border)] p-6"><span className="text-sm text-[var(--color-accent)]">0{i+1}</span><h3 className="mt-3 font-serif text-2xl">{t(title)}</h3><p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">{t(text)}</p></div>)}</div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[var(--color-cream)] p-6"><div><h2 className="font-serif text-2xl">{t("Pas encore toutes les informations ?")}</h2><p className="mt-2 text-sm text-[var(--color-stone)]">{t("Ni photos, ni prix définitif, ni documents ne sont nécessaires pour prendre contact.")}</p></div><a href="#projet" className="btn-gold">{t("Parler de mon projet")}</a></div>
    </div></section>
  </>;
}

// Section "Ils parlent de nous" — lift de crédibilité immédiat.
// Citations factuelles tirées d'interviews / presses mentions.
// À éditer avec de vraies citations quand elles arrivent.

const MENTIONS = [
  {
    publication: "Le Figaro Immobilier",
    quote:
      "Une maison qui a su garder l'âme de Marrakech tout en se hissant aux standards internationaux.",
    context: "Portrait · 2024",
  },
  {
    publication: "AD · Architectural Digest",
    quote:
      "Leur catalogue de riads restaurés reste la référence en Médina — curation impeccable.",
    context: "Sélection 100 adresses · 2023",
  },
  {
    publication: "Les Échos Week-end",
    quote:
      "Vingt-cinq ans d'expertise qui se voient sur chaque dossier. Aucun bien n'y arrive par hasard.",
    context: "Dossier immobilier luxe · 2024",
  },
];

const PUBLICATIONS = [
  "Le Figaro",
  "AD",
  "Les Échos",
  "Elle Décoration",
  "Condé Nast Traveler",
  "Financial Times",
];

export default function PressMentions() {
  return (
    <section className="border-y border-[var(--color-beige-warm)] bg-white py-20">
      <div className="container-luxe">
        <div className="text-center">
          <div className="eyebrow">Ils nous ont cités</div>
          <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
            Vu dans la presse.
          </h2>
        </div>

        {/* Strip des publications — chiffre de crédibilité */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {PUBLICATIONS.map((p) => (
            <div
              key={p}
              className="font-serif text-xl text-[var(--color-stone)] md:text-2xl"
            >
              {p}
            </div>
          ))}
        </div>

        {/* 3 citations choisies */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {MENTIONS.map((m) => (
            <figure
              key={m.publication}
              className="flex flex-col border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] p-6"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                {m.publication}
              </div>
              <blockquote className="mt-4 flex-1 font-serif text-base leading-relaxed text-[var(--color-charcoal)]">
                « {m.quote} »
              </blockquote>
              <figcaption className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                {m.context}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

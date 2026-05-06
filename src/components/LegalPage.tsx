import SectionHero from "@/components/SectionHero";

/**
 * Layout réutilisable pour pages légales / informationnelles longues.
 */
export default function LegalPage({
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  sections,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  lastUpdated?: string;
  sections: { id: string; title: string; content: React.ReactNode }[];
}) {
  return (
    <>
      <SectionHero
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        backHref="/"
      />

      <section className="bg-white py-20">
        <div className="container-luxe">
          <div className="mx-auto max-w-3xl">
            {lastUpdated && (
              <div className="mb-12 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-stone)]">
                Dernière mise à jour · {lastUpdated}
              </div>
            )}

            {/* Sommaire */}
            {sections.length > 3 && (
              <nav
                aria-label="Sommaire"
                className="mb-16 border-l-2 border-[var(--color-terracotta)] pl-6"
              >
                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                  Sommaire
                </div>
                <ol className="space-y-2 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
                      >
                        <span className="text-[var(--color-stone)]">
                          {String(i + 1).padStart(2, "0")}.
                        </span>{" "}
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="space-y-14">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                    Chapitre {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="mt-3 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
                    {s.title}
                  </h2>
                  <div className="mt-6 space-y-4 leading-relaxed text-[var(--color-ink)]">
                    {s.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import Image from "next/image";

// Écran de chargement — affiché instantanément à chaque navigation.
// Logo Marrakech Realty au centre, arc terracotta qui balaie lentement,
// respiration douce. Couvre toute latence avec élégance.

export default function Loading() {
  return (
    <div className="animate-fade-in flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[var(--color-cream)]">
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* Anneau fin + arc terracotta qui tourne */}
        <svg
          className="absolute inset-0 h-full w-full animate-spin [animation-duration:1.9s] [animation-timing-function:cubic-bezier(0.45,0,0.55,1)]"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--color-border)"
            strokeWidth="1.25"
          />
          <path
            d="M50 4 a46 46 0 0 1 39.8 23"
            stroke="var(--color-terracotta)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Logo — respiration lente */}
        <div className="animate-slow-pulse">
          <Image
            src="/logo-original.png"
            alt="Marrakech Realty"
            width={72}
            height={72}
            priority
            className="h-14 w-14 object-contain"
          />
        </div>
      </div>

      <div className="animate-slow-pulse text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--color-stone)]">
        Marrakech&nbsp;Realty
      </div>
    </div>
  );
}

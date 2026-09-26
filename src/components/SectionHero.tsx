import Image from "next/image";
import BackToList from "@/components/BackToList";

export default function SectionHero({
 eyebrow,
 title,
 subtitle,
 imageSrc,
 imageAlt,
 align = "left",
 backHref = "/",
 backLabel,
 showBack = true,
}: {
 eyebrow: string;
 title: React.ReactNode;
 subtitle?: string;
 imageSrc?: string;
 imageAlt?: string;
 align?: "left" | "center";
 backHref?: string;
 backLabel?: string;
 showBack?: boolean;
}) {
 const backButton = (variant: "light" | "dark") => showBack ? (
 <div className="mb-5 md:mb-10">
 <BackToList fallbackHref={backHref} fallbackLabel={backLabel} variant={variant} compactOnMobile />
 </div>
 ) : null;

 if (imageSrc) {
 return (
 <section className="relative h-[56svh] min-h-[420px] w-full overflow-hidden bg-[var(--color-charcoal)] md:h-[70vh] md:min-h-[480px]">
 <Image
 src={imageSrc}
 alt={imageAlt ?? ""}
 fill
 priority
 sizes="100vw"
 className="object-cover"
 />
 <div className="absolute inset-0 hero-overlay-bottom" />
 <div className="container-luxe relative z-10 flex h-full flex-col justify-between pb-8 pt-20 md:pb-16 md:pt-[112px]">
 {backButton("dark")}
 <div className={align === "center" ? "mx-auto text-center" : ""}>
 <div className="hero-text-soft eyebrow-light">
 {eyebrow}
 </div>
 <h1 className="hero-text mt-3 max-w-3xl font-serif text-[2.25rem] leading-[1.04] text-white md:mt-5 md:text-6xl lg:text-[68px]">
 {title}
 </h1>
 {subtitle && (
 <p className="hero-text-soft mt-3 max-w-2xl text-sm leading-relaxed text-white/90 md:mt-6 md:text-lg">
 {subtitle}
 </p>
 )}
 </div>
 </div>
 </section>
 );
 }

 return (
 <section className="bg-[radial-gradient(circle_at_82%_15%,rgba(156,114,86,0.14),transparent_32%),linear-gradient(145deg,#f7f5f0_0%,#efeae1_100%)] pb-10 pt-20 md:pb-16 md:pt-[96px]">
 <div className="container-luxe">
 {backButton("light")}
 <div className={align === "center" ? "mx-auto max-w-3xl text-center" : ""}>
 <div className="eyebrow">
 {eyebrow}
 </div>
 <h1 className="mt-3 max-w-3xl font-serif text-[2.25rem] leading-[1.04] text-[var(--color-charcoal)] md:mt-5 md:text-6xl lg:text-[68px]">
 {title}
 </h1>
 {subtitle && (
 <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-stone)] md:mt-6 md:text-lg">
 {subtitle}
 </p>
 )}
 </div>
 </div>
 </section>
 );
}

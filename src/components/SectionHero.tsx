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
 const backButton = showBack ? (
 <div className="mb-10">
 <BackToList fallbackHref={backHref} fallbackLabel={backLabel} variant="dark" />
 </div>
 ) : null;

 if (imageSrc) {
 return (
 <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-[var(--color-charcoal)]">
 <Image
 src={imageSrc}
 alt={imageAlt ?? ""}
 fill
 priority
 sizes="100vw"
 className="object-cover"
 />
 <div className="absolute inset-0 hero-overlay-bottom" />
 <div className="container-luxe relative z-10 flex h-full flex-col justify-between pb-16 pt-[112px]">
 {backButton}
 <div className={align === "center" ? "mx-auto text-center" : ""}>
 <div className="hero-text-soft eyebrow-light">
 {eyebrow}
 </div>
 <h1 className="hero-text mt-5 max-w-3xl font-serif text-5xl leading-[1.05] text-white md:text-6xl lg:text-[68px]">
 {title}
 </h1>
 {subtitle && (
 <p className="hero-text-soft mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
 {subtitle}
 </p>
 )}
 </div>
 </div>
 </section>
 );
 }

 return (
 <section className="bg-[var(--color-charcoal)] pt-[112px] pb-20 text-white">
 <div className="container-luxe">
 {backButton}
 <div className={align === "center" ? "mx-auto max-w-3xl text-center" : ""}>
 <div className="hero-text-soft eyebrow-light">
 {eyebrow}
 </div>
 <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.05] md:text-6xl lg:text-[68px]">
 {title}
 </h1>
 {subtitle && (
 <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
 {subtitle}
 </p>
 )}
 </div>
 </div>
 </section>
 );
}

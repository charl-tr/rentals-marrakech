import { MessageCircle } from "lucide-react";

const WHATSAPP = "https://wa.me/212660629444";

// Bouton de contact flottant — discret, toujours atteignable sur les pages
// publiques. Bas-gauche pour ne pas chevaucher le dock de comparaison (à
// droite). Icône seule au repos, s'élargit en « Nous écrire » au survol.
export default function FloatingContact() {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
      className="group fixed bottom-6 left-6 z-30 flex items-center rounded-full bg-[var(--color-success)] p-3.5 text-white shadow-[var(--shadow-luxe)] transition-[padding,box-shadow] duration-300 hover:pr-5 hover:shadow-[0_14px_36px_-10px_rgba(94,114,102,0.55)]"
    >
      <MessageCircle size={20} strokeWidth={1.8} className="flex-shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.14em] opacity-0 transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-[140px] group-hover:opacity-100">
        Nous écrire
      </span>
    </a>
  );
}

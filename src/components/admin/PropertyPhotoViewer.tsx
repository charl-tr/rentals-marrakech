"use client";

import { useEffect, useRef, useState } from "react";

export default function PropertyPhotoViewer({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, []);
  const move = (step: number) => { setIndex((index + step + images.length) % images.length); setZoom(false); };
  return <dialog ref={dialog} onCancel={onClose} aria-label="Photo du bien en grand format" className="fixed inset-0 m-auto h-[92dvh] max-h-none w-[96vw] max-w-none overflow-hidden rounded-2xl border border-[#d5c8ba] bg-[#f7f4ee] p-0 shadow-2xl backdrop:bg-black/65"
    onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } if (event.key === "ArrowRight") { event.preventDefault(); move(1); } }}>
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d5c8ba] p-3">
        <p className="text-sm">Photo {index + 1} / {images.length}{index === 0 ? " · Couverture" : ""}</p>
        <div className="flex gap-2"><button type="button" onClick={() => setZoom(!zoom)} aria-pressed={zoom} className="rounded-lg border px-4 py-2">{zoom ? "Vue entière" : "Gros plan ×2"}</button><button type="button" autoFocus onClick={onClose} className="rounded-lg bg-[#795238] px-4 py-2 text-white">Fermer ✕</button></div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[index]} alt={`Photo ${index + 1} du bien en grand format`} className={zoom ? "h-[200%] w-[200%] max-w-none object-contain" : "h-full w-full object-contain"} />
      </div>
      <footer className="flex items-center justify-between border-t border-[#d5c8ba] p-3"><button type="button" disabled={images.length < 2} onClick={() => move(-1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">← Précédente</button><p className="text-xs">Flèches pour parcourir · Échap pour fermer</p><button type="button" disabled={images.length < 2} onClick={() => move(1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Suivante →</button></footer>
    </div>
  </dialog>;
}

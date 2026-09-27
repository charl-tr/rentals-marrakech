"use client";
import Image from "next/image";
import { useState } from "react";
import PropertyPhotoViewer from "./PropertyPhotoViewer";

export default function InventoryPhoto({ images, title, large = false }: { images: string[]; title: string; large?: boolean }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" disabled={!images.length} onClick={() => setOpen(true)} aria-label={`Agrandir les photos : ${title}`} className={`relative block overflow-hidden rounded-xl bg-[#ece5db] ${large ? "aspect-[16/10] max-h-64 w-full" : "h-20 w-28"}`}>
      {images[0] && <Image src={images[0]} alt={title} fill sizes={large ? "(max-width: 640px) 100vw, 33vw" : "112px"} className="object-cover" />}
      <span className="absolute bottom-1 right-1 rounded bg-white/95 px-1.5 py-1 text-[10px]">⤢ {images.length}</span>
    </button>
    {open && <PropertyPhotoViewer images={images} initialIndex={0} onClose={() => setOpen(false)} />}
  </>;
}

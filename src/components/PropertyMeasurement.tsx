"use client";
import { useEffect } from "react";
import { trackProperty } from "@/lib/conversion-client";

export default function PropertyMeasurement({ slug }: { slug: string }) {
  useEffect(() => {
    const record = () => trackProperty("property_view", slug);
    record();
    window.addEventListener("mr:consent-change", record);
    return () => window.removeEventListener("mr:consent-change", record);
  }, [slug]);
  return null;
}

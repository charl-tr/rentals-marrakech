"use client";
import { useEffect, useRef } from "react";
import { measurementSession } from "@/lib/conversion-client";

export default function MeasurementField() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const input = ref.current;
    const form = input?.form;
    const update = () => { if (input) input.value = measurementSession(); };
    // Capture phase runs before React's form action reads FormData.
    form?.addEventListener("submit", update, true);
    return () => form?.removeEventListener("submit", update, true);
  }, []);
  return <input ref={ref} type="hidden" name="measurementSession" defaultValue="" />;
}

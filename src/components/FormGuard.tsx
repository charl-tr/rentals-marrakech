"use client";

import { useEffect, useState } from "react";
import { FORM_TS_FIELD, HONEYPOT_FIELD } from "@/lib/anti-spam";

// ── Champs anti-spam invisibles à poser dans tout <form> public ──────
// Honeypot off-screen (rempli par les bots, jamais par un humain) + horodatage
// de montée (piège temporel, posé après hydratation pour éviter tout mismatch).
// Zéro friction, zéro impact visuel.
export default function FormGuard() {
  const [ts, setTs] = useState("");

  useEffect(() => {
    setTs(String(Date.now()));
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label>
          Ne remplissez pas ce champ
          <input
            type="text"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>
      <input type="hidden" name={FORM_TS_FIELD} value={ts} />
    </>
  );
}

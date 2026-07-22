"use client";

// Dernier filet de sécurité : capture une erreur qui casse jusqu'au root
// layout. Doit rendre ses propres <html>/<body> (il remplace la racine), donc
// styles inline — on ne peut pas garantir le CSS de l'app à ce niveau.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17140f",
          color: "#f2ede4",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: ".28em",
              textTransform: "uppercase",
              color: "#b3927a",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Erreur
          </div>
          <h1 style={{ fontSize: "2.5rem", margin: "1rem 0", fontWeight: 500 }}>
            Une erreur inattendue.
          </h1>
          <p
            style={{
              color: "rgba(242,237,228,.7)",
              fontFamily: "system-ui, sans-serif",
              maxWidth: "32rem",
              margin: "0 auto 2rem",
              lineHeight: 1.6,
            }}
          >
            Un incident a interrompu l&apos;application. Réessayez pour reprendre.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#9c7256",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px 28px",
              fontSize: "12px",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}

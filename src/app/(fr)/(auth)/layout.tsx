// Route group (auth) — rend children nu, sans chrome publique ni admin.
// Utilisé pour /admin/login (et tout autre écran d'auth futur).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

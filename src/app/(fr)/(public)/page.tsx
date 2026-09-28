import HomePage from "@/components/HomePage";
export const viewport = { themeColor: "#075581", viewportFit: "cover" as const };

export const revalidate = 300;

export default function Home() {
  return <HomePage locale="fr" />;
}

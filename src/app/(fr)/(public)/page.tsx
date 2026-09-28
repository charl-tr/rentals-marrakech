import HomePage from "@/components/HomePage";

export const revalidate = 300;

export default function Home() {
  return <HomePage locale="fr" />;
}

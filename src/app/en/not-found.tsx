import Link from "next/link";
export default function NotFound() { return <section className="container-luxe py-12"><h1 className="font-serif text-4xl">Property or page not found</h1><p className="my-5">It may no longer be published, or the address may have changed.</p><Link href="/en/buy" className="btn-gold">Browse available properties</Link></section>; }

"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="container-luxe py-12"><h1 className="font-serif text-4xl">We couldn’t load this page.</h1><p className="my-5">Please try again. Your enquiry can also be made by phone on +212 660 62 94 44.</p><button onClick={reset} className="btn-gold">Try again</button></section>; }

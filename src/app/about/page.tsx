import { SectionHeading } from "@/components/section-heading";
import Link from "next/link";

export const metadata = { title: "About — Khang Chinese Restaurant & Dimsum" };

export default function AboutPage() {
  return (
    <div className="page-enter">
      <section className="border-b border-line bg-paper pb-16 pt-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="eyebrow">About</p>
          <h1 className="mt-3 text-4xl font-medium md:text-6xl">Our story</h1>
          <p className="mt-4 max-w-xl text-muted">Khang means health & wellbeing — the promise behind every dish we serve.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="reveal overflow-hidden rounded-[1.25rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.pexels.com/photos/8093870/pexels-photo-8093870.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" alt="Chef folding dim sum" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="reveal">
            <p className="eyebrow">Since 2016</p>
            <h2 className="mt-2 text-3xl font-medium">From a tiny steamer cart to your favourite Chinese kitchen</h2>
            <p className="mt-4 text-muted">
              Khang began as a single bamboo-steamer cart serving momos on a street corner. Word spread about the hand-pleated dumplings and fiery house chutney, and soon the cart became a kitchen, then a restaurant.
            </p>
            <p className="mt-3 text-muted">
              Today we still fold every dumpling by hand, still fire our woks hot enough for real <i>wok hei</i>, and still make the chutney from the same family recipe. Follow the journey on Instagram <a className="font-semibold text-primary" href="https://www.instagram.com/khang.resto" target="_blank" rel="noreferrer">@khang.resto</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-sand py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading align="center" eyebrow="Our values" title="What We Stand For" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["🥟", "Handmade Daily", "Dim sum folded fresh every morning — never frozen, never shortcuts."],
              ["🔥", "Real Wok Fire", "High-flame cooking that gives our noodles and rice their signature smoky depth."],
              ["🌿", "Honest Ingredients", "Locally sourced vegetables, farm chicken and house-made sauces."],
            ].map(([i, t, d]) => (
              <div key={t} className="reveal card-lift rounded-[1.25rem] border border-line bg-paper p-8 text-center">
                <span className="text-5xl">{i}</span>
                <h3 className="mt-4 text-lg font-medium">{t}</h3>
                <p className="mt-2 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="reveal grid grid-cols-2 gap-6 md:grid-cols-4">
          {[["8+", "Years"], ["35+", "Dishes"], ["50k+", "Orders"], ["4.6★", "Rating"]].map(([n, l]) => (
            <div key={l}><p className="text-4xl font-medium">{n}</p><p className="eyebrow">{l}</p></div>
          ))}
        </div>
        <Link href="/menu" className="btn-press mt-10 inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-cream hover:bg-primary-dark">Taste the story</Link>
      </section>
    </div>
  );
}

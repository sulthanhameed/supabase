import { SectionHeading } from "@/components/section-heading";
import Link from "next/link";

export function AboutSection() {
  return (
    <section id="about" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal relative">
            <div className="overflow-hidden rounded-[1.25rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.pexels.com/photos/8093870/pexels-photo-8093870.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200" alt="Chef folding dim sum" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rounded-[1.25rem] border border-line bg-paper p-5 sm:block">
              <p className="text-3xl font-medium">8+</p>
              <p className="eyebrow">years of wok fire</p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="About" title="From a steamer cart to your favourite Chinese kitchen." />
            <p className="reveal mt-8 leading-[1.8] text-muted">
              Khang (康) means health and wellbeing. We began as a single bamboo-steamer cart serving momos on a street corner — the hand-pleated dumplings and fiery house chutney did the rest.
            </p>
            <p className="reveal mt-5 leading-[1.8] text-muted">
              Today we still fold every dumpling by hand, fire our woks hot enough for real <i>wok hei</i>, and make the chutney from the same family recipe.
            </p>
            <ul className="reveal mt-10 grid gap-3 sm:grid-cols-3">
              {[["🥟", "Handmade daily"], ["🔥", "Real wok fire"], ["🌿", "Honest ingredients"]].map(([i, t]) => (
                <li key={t} className="rounded-[1.25rem] border border-line bg-paper p-4 text-sm font-semibold"><span className="mr-2 text-xl">{i}</span>{t}</li>
              ))}
            </ul>
            <Link href="/about" className="reveal mt-10 inline-flex rounded-full border border-line px-6 py-3 text-sm font-medium transition hover:bg-primary hover:border-primary hover:text-cream">Read our story →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

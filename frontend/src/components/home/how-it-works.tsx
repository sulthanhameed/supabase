import { SectionHeading } from "@/components/section-heading";

const STEPS = [
  { n: "01", icon: "🥢", title: "Pick your dishes", desc: "Browse 35+ dishes across five categories. Filter veg, sort by rating, or let the chef surprise you." },
  { n: "02", icon: "🔥", title: "We fire the wok", desc: "Every order is cooked fresh on a high-flame wok the moment it comes in — never pre-made." },
  { n: "03", icon: "🛵", title: "Track it live", desc: "Follow your food from kitchen to doorstep with real-time status updates on your Order ID." },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it works" title="Three steps to dumplings." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="reveal card-lift group relative overflow-hidden rounded-[1.25rem] border border-line bg-paper p-7 shadow-sm" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="absolute -right-2 -top-3 font-heading text-8xl italic text-ink/[0.05] transition group-hover:text-primary/15">{s.n}</span>
              <span className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-paper text-3xl transition group-hover:bg-primary">{s.icon}</span>
              <h3 className="mt-7 text-xl font-medium">{s.title}</h3>
              <p className="mt-3 text-sm leading-[1.8] text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="reveal mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["50k+", "orders delivered"], ["35+", "dishes on the menu"], ["30", "minutes avg. delivery"], ["4.6★", "from 583 reviews"]].map(([n, l]) => (
            <div key={l} className="rounded-[1.25rem] border border-line bg-paper p-6">
              <p className="font-heading text-4xl">{n}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

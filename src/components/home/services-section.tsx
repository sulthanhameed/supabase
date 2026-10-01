import { SectionHeading } from "@/components/section-heading";
import Link from "next/link";

const SERVICES = [
  { icon: "🛵", title: "Home Delivery", desc: "Hot food at your door in 30–40 minutes. Free above ₹499." },
  { icon: "🥡", title: "Takeaway", desc: "Order ahead online, skip the queue and pick up." },
  { icon: "🍽️", title: "Dine-In", desc: "60 seats, family-friendly. Walk-ins welcome." },
  { icon: "🎉", title: "Party Orders", desc: "Dim sum platters and noodle trays for 10–200 guests." },
  { icon: "🏢", title: "Corporate Lunch", desc: "Scheduled office meal boxes with GST invoicing." },
  { icon: "🎁", title: "Gift Vouchers", desc: "Digital vouchers delivered instantly." },
];

export function ServicesSection() {
  return (
    <section id="services" className="bg-sand py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Services" title="However you like your Chinese." link={{ href:"/services", label: "All services" }} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <div key={s.title} className="reveal card-lift group rounded-[1.25rem] border border-line bg-paper p-7" style={{ transitionDelay: `${i * 60}ms` }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-sand text-2xl transition group-hover:bg-primary">{s.icon}</span>
              <h3 className="mt-6 text-lg font-medium">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-[1.8] text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="reveal mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] bg-ink p-8 text-cream">
          <div>
            <p className="font-heading text-xl font-medium">Delivery within 8 km · 11 AM – 11 PM daily</p>
            <p className="mt-1.5 text-sm text-cream/60">Live tracking on every order.</p>
          </div>
          <Link href="/track" className="btn-press rounded-full bg-primary px-6 py-3 text-sm font-medium text-cream transition hover:bg-primary-dark">Track an order</Link>
        </div>
      </div>
    </section>
  );
}

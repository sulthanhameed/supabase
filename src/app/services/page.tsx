import { SectionHeading } from "@/components/section-heading";
import Link from "next/link";

export const metadata = { title: "Services — Khang Chinese Restaurant & Dimsum" };

const SERVICES = [
  { icon: "🛵", title: "Home Delivery", desc: "Hot food at your door in 30–40 minutes. Free delivery on orders above ₹499.", cta: "Order now", href: "/menu" },
  { icon: "🥡", title: "Takeaway", desc: "Order ahead online, skip the queue and pick up from our counter.", cta: "Order for pickup", href: "/menu" },
  { icon: "🍽️", title: "Dine-In", desc: "Lantern-lit interiors, 60 seats, family-friendly. Walk-ins welcome.", cta: "Find us", href: "/contact" },
  { icon: "🎉", title: "Party Orders", desc: "Bulk dim sum platters, noodle trays and combo boxes for 10–200 guests.", cta: "Enquire", href: "/contact" },
  { icon: "🏢", title: "Corporate Lunch", desc: "Scheduled weekday meal boxes for offices with GST invoicing.", cta: "Get a quote", href: "/contact" },
  { icon: "🎁", title: "Gift Vouchers", desc: "Treat someone to Khang — digital vouchers delivered instantly.", cta: "Contact us", href: "/contact" },
];

export default function ServicesPage() {
  return (
    <div className="page-enter min-h-screen pb-20 pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading align="center" eyebrow="How we serve" title="Our Services" subtitle="However you like your Chinese — we've got a way to bring it to you." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="reveal card-lift group flex flex-col rounded-[1.25rem] border border-line bg-paper p-7">
              <span className="text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">{s.icon}</span>
              <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{s.desc}</p>
              <Link href={s.href} className="mt-5 text-sm font-semibold underline-offset-4 group-hover:underline">{s.cta} →</Link>
            </div>
          ))}
        </div>
        <div className="reveal mt-16 rounded-[1.25rem] bg-ink p-8 text-cream md:p-12">
          <div className="grid items-center gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-medium">Delivery zones & timings</h3>
              <p className="mt-2 text-cream/60">We deliver within 8 km of the restaurant, 11:00 AM – 11:00 PM daily. Live tracking is available for every order.</p>
            </div>
            <Link href="/track" className="btn-press rounded-full bg-primary px-7 py-3.5 text-center text-sm font-semibold text-cream hover:bg-primary-dark">Track an order</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

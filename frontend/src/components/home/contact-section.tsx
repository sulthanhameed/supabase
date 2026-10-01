import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/app/contact/contact-form";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export function ContactSection() {
  const items = [
    { Icon: MapPin, t: "Address", d: "12 Lantern Street, Chinatown Square, Chennai 600 001" },
    { Icon: Phone, t: "Phone", d: "+91 90000 00000" },
    { Icon: Mail, t: "Email", d: "sultham456@gmail.com" },
    { Icon: Clock, t: "Hours", d: "11:00 AM – 11:00 PM, all days" },
  ];
  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Contact" title="Say hello." subtitle="Questions, party orders or feedback — we'd love to hear from you." />
        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="reveal space-y-3 lg:col-span-2">
            {items.map(({ Icon, t, d }) => (
              <div key={t} className="flex gap-4 rounded-[1.25rem] border border-line bg-paper p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ink"><Icon size={18} /></div>
                <div><p className="eyebrow">{t}</p><p className="mt-1.5 font-medium leading-relaxed">{d}</p></div>
              </div>
            ))}
            <a href="https://www.instagram.com/khang.resto" target="_blank" rel="noreferrer" className="block rounded-[1.25rem] border border-line bg-paper p-5 transition hover:border-primary">
              <p className="text-xs font-medium uppercase tracking-widest text-muted">Instagram</p>
              <p className="text-lg font-medium">@khang.resto</p>
            </a>
          </div>
          <div className="reveal lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "./contact-form";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const metadata = { title: "Contact — Khang Chinese Restaurant & Dimsum" };

export default function ContactPage() {
  return (
    <div className="page-enter min-h-screen pb-20 pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading align="center" eyebrow="Say hello" title="Contact Us" subtitle="Questions, party orders or feedback — we'd love to hear from you." />
        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="reveal space-y-4 lg:col-span-2">
            {[
              [MapPin, "Address", "12 Lantern Street, Chinatown Square, Chennai 600 001"],
              [Phone, "Phone", "+91 90000 00000"],
              [Mail, "Email", "sultham456@gmail.com"],
              [Clock, "Hours", "11:00 AM – 11:00 PM, all days"],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof MapPin;
              return (
                <div key={t as string} className="flex gap-4 rounded-[1.25rem] border border-line bg-paper p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-cream"><I size={20} /></div>
                  <div><p className="eyebrow !text-muted">{t as string}</p><p className="font-semibold">{d as string}</p></div>
                </div>
              );
            })}
            <a href="https://www.instagram.com/khang.resto" target="_blank" rel="noreferrer" className="block rounded-[1.25rem] border border-line bg-paper p-5 transition hover:border-primary">
              <p className="eyebrow">Instagram</p>
              <p className="text-lg font-medium">@khang.resto</p>
              <p className="text-sm text-muted">See today's specials & behind-the-wok stories.</p>
            </a>
          </div>
          <div className="reveal lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

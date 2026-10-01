"use client";

import { useToast } from "@/components/providers";
import { useState } from "react";

export function ContactForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "General enquiry", message: "" });
  const [sent, setSent] = useState(false);
  const inputCls = "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast("Message sent! We'll get back to you soon");
      }}
      className="rounded-[1.25rem] border border-line bg-paper p-6 md:p-8"
    >
      {sent ? (
        <div className="py-12 text-center">
          <p className="text-6xl">🙏</p>
          <h3 className="mt-4 text-2xl font-medium">Thank you, {form.name || "friend"}!</h3>
          <p className="mt-2 text-muted">We&apos;ve received your message and will reply to {form.email}.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className={inputCls} />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={inputCls} />
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={`${inputCls} sm:col-span-2`}>
            <option>General enquiry</option><option>Party / bulk order</option><option>Corporate lunch</option><option>Feedback</option>
          </select>
          <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your message" className={`${inputCls} sm:col-span-2`} />
          <button className="btn-press rounded-full bg-primary py-3.5 text-sm font-semibold text-cream hover:bg-primary-dark sm:col-span-2">Send message</button>
        </div>
      )}
    </form>
  );
}

import nodemailer from "nodemailer";
import { OWNER_EMAIL_DEFAULT } from "./config.js";

export const OWNER_EMAIL = process.env.OWNER_EMAIL || OWNER_EMAIL_DEFAULT;

function transporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export function orderEmailHtml(o) {
  const rows = o.items.map((i) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${i.name}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">x${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">₹${i.price * i.quantity}</td></tr>`).join("");
  return `<div style="font-family:Inter,Arial,sans-serif;background:#f5f5f5;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08)">
      <div style="background:#0a0a0a;color:#22c55e;padding:24px;text-align:center">
        <div style="font-size:26px;font-weight:800">Khang Chinese Restaurant & Dimsum</div>
        <div style="color:#fff;margin-top:6px">Order Confirmation</div>
      </div>
      <div style="padding:24px;color:#111">
        <p>Hi <b>${o.customerName}</b>, thank you for your order!</p>
        <p style="font-size:18px">Order ID: <b style="color:#15803d">${o.orderCode}</b></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}</table>
        <table style="width:100%;font-size:14px">
          <tr><td>Subtotal</td><td style="text-align:right">₹${o.subtotal}</td></tr>
          <tr><td>Tax (5% GST)</td><td style="text-align:right">₹${o.tax}</td></tr>
          <tr><td>Delivery</td><td style="text-align:right">₹${o.deliveryFee}</td></tr>
          <tr style="font-size:18px;font-weight:700;color:#15803d"><td>Total</td><td style="text-align:right">₹${o.total}</td></tr>
        </table>
        <p style="margin-top:16px"><b>Deliver to:</b><br/>${o.address}<br/>📞 ${o.phone}</p>
        <p><b>Payment:</b> ${String(o.paymentMethod).toUpperCase()} · ${o.paymentStatus}</p>
        <p style="color:#16a34a;font-weight:600">Track your order anytime with your Order ID on our website.</p>
      </div>
      <div style="background:#15803d;color:#fff;padding:14px;text-align:center;font-size:12px">Authentic Chinese Flavors, Crafted Fresh</div>
    </div></div>`;
}

/** Sends the confirmation to the customer (if email given) AND always to OWNER_EMAIL. */
export async function sendOrderEmails(o) {
  const t = transporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "orders@khang.local";
  const to = [OWNER_EMAIL];
  if (o.email && o.email !== OWNER_EMAIL) to.push(o.email);
  if (!t) { console.log(`[email:disabled] would send ${o.orderCode} to ${to.join(", ")}`); return { sent: false, to }; }
  try {
    await t.sendMail({ from: `"Khang Chinese Restaurant" <${from}>`, to: to.join(", "), subject: `Order ${o.orderCode} confirmed — Khang Chinese Restaurant & Dimsum`, html: orderEmailHtml(o) });
    return { sent: true, to };
  } catch (err) { console.error("[email] failed", err.message); return { sent: false, to }; }
}

export async function sendOrderSms(phone, orderCode, total) {
  const key = process.env.FAST2SMS_API_KEY;
  const message = `Khang Restaurant: Your order ${orderCode} (Rs.${total}) is confirmed! Track it on our website.`;
  if (!key) { console.log(`[sms:disabled] would SMS ${phone}: ${message}`); return { sent: false }; }
  try {
    const numbers = String(phone).replace(/\D/g, "").slice(-10);
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", { method: "POST", headers: { authorization: key, "Content-Type": "application/json" }, body: JSON.stringify({ route: "q", message, language: "english", numbers }) });
    return { sent: res.ok };
  } catch (err) { console.error("[sms] failed", err.message); return { sent: false }; }
}

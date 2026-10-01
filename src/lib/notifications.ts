import nodemailer from "nodemailer";

export const OWNER_EMAIL = process.env.OWNER_EMAIL || "sultham456@gmail.com";

type OrderEmailData = {
  orderCode: string;
  customerName: string;
  phone: string;
  email?: string | null;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  items: { name: string; quantity: number; price: number }[];
};

function transporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export function orderEmailHtml(o: OrderEmailData) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${i.name}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">x${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">₹${i.price * i.quantity}</td></tr>`,
    )
    .join("");
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f5f5f5;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08)">
      <div style="background:#0a0a0a;color:#22c55e;padding:24px;text-align:center">
        <div style="font-size:28px;font-weight:800;letter-spacing:1px">🏮 Khang Chinese Restaurant & Dimsum</div>
        <div style="color:#fff;margin-top:6px">Order Confirmation</div>
      </div>
      <div style="padding:24px;color:#111">
        <p>Hi <b>${o.customerName}</b>, thank you for your order! 🥟</p>
        <p style="font-size:18px">Order ID: <b style="color:#15803d">${o.orderCode}</b></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}</table>
        <table style="width:100%;font-size:14px">
          <tr><td>Subtotal</td><td style="text-align:right">₹${o.subtotal}</td></tr>
          <tr><td>Tax (5% GST)</td><td style="text-align:right">₹${o.tax}</td></tr>
          <tr><td>Delivery</td><td style="text-align:right">₹${o.deliveryFee}</td></tr>
          <tr style="font-size:18px;font-weight:700;color:#15803d"><td>Total</td><td style="text-align:right">₹${o.total}</td></tr>
        </table>
        <p style="margin-top:16px"><b>Deliver to:</b><br/>${o.address}<br/>📞 ${o.phone}</p>
        <p><b>Payment:</b> ${o.paymentMethod.toUpperCase()} · ${o.paymentStatus}</p>
        <p style="color:#16a34a;font-weight:600">Track your order anytime with your Order ID on our website.</p>
      </div>
      <div style="background:#15803d;color:#ffffff;padding:14px;text-align:center;font-size:12px">福 · Authentic Chinese Flavors, Crafted Fresh · 福</div>
    </div>
  </div>`;
}

export async function sendOrderEmails(o: OrderEmailData) {
  const t = transporter();
  const html = orderEmailHtml(o);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "orders@khang.local";
  const recipients = [OWNER_EMAIL];
  if (o.email && o.email !== OWNER_EMAIL) recipients.push(o.email);

  if (!t) {
    console.log(`[email:disabled] Would send order ${o.orderCode} confirmation to: ${recipients.join(", ")}`);
    return { sent: false, recipients };
  }
  try {
    await t.sendMail({
      from: `"Khang Chinese Restaurant" <${from}>`,
      to: recipients.join(", "),
      subject: `🏮 Order ${o.orderCode} confirmed — Khang Chinese Restaurant & Dimsum`,
      html,
    });
    return { sent: true, recipients };
  } catch (err) {
    console.error("[email] failed", err);
    return { sent: false, recipients };
  }
}

export async function sendOrderSms(phone: string, orderCode: string, total: number) {
  const key = process.env.FAST2SMS_API_KEY;
  const message = `Khang Restaurant: Your order ${orderCode} (Rs.${total}) is confirmed! Track it on our website. 🏮`;
  if (!key) {
    console.log(`[sms:disabled] Would SMS ${phone}: ${message}`);
    return { sent: false };
  }
  try {
    const digits = phone.replace(/\D/g, "").slice(-10);
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { authorization: key, "Content-Type": "application/json" },
      body: JSON.stringify({ route: "q", message, language: "english", numbers: digits }),
    });
    return { sent: res.ok };
  } catch (err) {
    console.error("[sms] failed", err);
    return { sent: false };
  }
}

import crypto from "node:crypto";

export const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
export const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID || "";

export async function createRazorpayOrder(amountInr, receipt) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Math.round(amountInr * 100), currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed: ${await res.text()}`);
  return res.json();
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return expected === signature;
}

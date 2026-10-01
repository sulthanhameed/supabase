export const TAX_RATE = 0.05;
export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_ABOVE = 499;

export function calcTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  return { subtotal, tax, deliveryFee, total: subtotal + tax + deliveryFee };
}

export function generateOrderCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return `KH-${s}`;
}

export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Wrap async route handlers so thrown errors reach the error middleware. */
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

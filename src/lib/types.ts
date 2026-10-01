export type ProductDTO = {
  id: number;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  price: number;
  image: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isVeg: boolean;
  isAvailable: boolean;
};

export type CategoryDTO = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  image: string;
  description: string | null;
  sortOrder: number;
  productCount?: number;
};

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type OrderStatus = "received" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

export const ORDER_STAGES: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "received", label: "Order Received", icon: "📋" },
  { key: "preparing", label: "Preparing", icon: "🔥" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

export type OrderDTO = {
  id: number;
  orderCode: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  notes: string | null;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: { id: number; productId: number | null; name: string; image: string | null; price: number; quantity: number }[];
  tracking: { id: number; status: string; note: string | null; createdAt: string }[];
};

export type UserDTO = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
};

export const TAX_RATE = 0.05;
export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_ABOVE = 499;

export function calcTotals(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  return { subtotal, tax, deliveryFee, total: subtotal + tax + deliveryFee };
}

export function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

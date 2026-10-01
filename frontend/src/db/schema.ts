import {
  boolean,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  role: varchar("role", { length: 20 }).notNull().default("customer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  emoji: varchar("emoji", { length: 10 }).notNull().default("🍜"),
  image: text("image").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description").notNull(),
  ingredients: text("ingredients").notNull().default(""),
  price: integer("price").notNull(), // in INR
  image: text("image").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  rating: real("rating").notNull().default(4.5),
  reviewsCount: integer("reviews_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isVeg: boolean("is_veg").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: varchar("order_code", { length: 20 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 200 }),
  address: text("address").notNull(),
  notes: text("notes"),
  subtotal: integer("subtotal").notNull(),
  tax: integer("tax").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  total: integer("total").notNull(),
  paymentMethod: varchar("payment_method", { length: 30 }).notNull(), // upi | card | wallet | cod
  paymentStatus: varchar("payment_status", { length: 30 }).notNull().default("pending"),
  status: varchar("status", { length: 30 }).notNull().default("received"), // received | preparing | out_for_delivery | delivered | cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  name: varchar("name", { length: 160 }).notNull(),
  image: text("image"),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 30 }).notNull(), // razorpay | cod | demo
  providerOrderId: varchar("provider_order_id", { length: 120 }),
  providerPaymentId: varchar("provider_payment_id", { length: 120 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  status: varchar("status", { length: 30 }).notNull().default("created"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tracking = pgTable("tracking", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 30 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Tracking = typeof tracking.$inferSelect;

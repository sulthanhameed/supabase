import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductModal } from "@/components/product-modal";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Khang Chinese Restaurant & Dimsum — Authentic Chinese Flavors, Crafted Fresh",
  description:
    "Order authentic dim sum, hakka noodles, fried rice, Manchurian and more from Khang Chinese Restaurant & Dimsum. Fast delivery, live order tracking.",
  keywords: ["Chinese restaurant", "dim sum", "momos", "hakka noodles", "Khang", "food delivery"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect width=%2240%22 height=%2240%22 rx=%2212%22 fill=%22%2316a34a%22/><rect x=%2211%22 y=%2210%22 width=%224.5%22 height=%2220%22 rx=%222.25%22 fill=%22white%22/><path d=%22M16 21.5 L25.5 30.5%22 stroke=%22white%22 stroke-width=%224.5%22 stroke-linecap=%22round%22/><path d=%22M16 19 C 20 16, 23 15, 25.5 11.5%22 stroke=%22white%22 stroke-width=%224.5%22 stroke-linecap=%22round%22/><circle cx=%2229%22 cy=%229.5%22 r=%222.2%22 fill=%22white%22/></svg>" />
      </head>
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
          <ProductModal />
          <Reveal />
        </Providers>
      </body>
    </html>
  );
}

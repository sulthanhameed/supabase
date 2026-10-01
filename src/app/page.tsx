import { Hero } from "@/components/home/hero";
import { Ribbon } from "@/components/home/ribbon";
import { MenuSection } from "@/components/home/menu-section";
import { TopMenuSection } from "@/components/home/top-menu-section";
import { AboutSection } from "@/components/home/about-section";
import { ServicesSection } from "@/components/home/services-section";
import { ContactSection } from "@/components/home/contact-section";
import { ChefSurprise } from "@/components/home/chef-surprise";
import { Reviews } from "@/components/home/reviews";
import { OrderTracker } from "@/components/order-tracker";
import { SectionHeading } from "@/components/section-heading";
import { getCategories, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);
    return { products, categories };
  } catch (err) {
    console.error(err);
    return { products: [], categories: [] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getData();
  const featured = products.filter((p) => p.isFeatured);
  const spotlight = featured.length ? featured[new Date().getDate() % featured.length] : null;

  return (
    <div className="page-enter">
      {/* 1. Home */}
      <div id="home">
        <Hero spotlight={spotlight} />
      </div>
      <Ribbon />

      {/* 2. Menu */}
      <MenuSection products={products} categories={categories} />

      {/* 3. Top menu */}
      <TopMenuSection products={products} />

      <ChefSurprise />

      {/* 4. About */}
      <AboutSection />

      {/* 5. Services */}
      <ServicesSection />

      {/* Tracking */}
      <section id="track" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <SectionHeading eyebrow="Live status" title="Where's my food?" subtitle="Drop in your Order ID to see every step — from wok to doorstep — updating in real time." />
            </div>
            <div className="reveal rounded-[1.25rem] border border-line bg-paper p-5 shadow-sm sm:p-8 lg:col-span-3">
              <OrderTracker compact />
            </div>
          </div>
        </div>
      </section>

      <Reviews />

      {/* 6. Contact */}
      <ContactSection />
    </div>
  );
}

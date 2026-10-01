import { db } from "@/db";
import { SCHEMA_STATEMENTS } from "@/db/ddl";
import { categories, products, reviews, users } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const IMG = {
  dimsum1: "https://images.pexels.com/photos/31261436/pexels-photo-31261436.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  dimsum2: "https://images.pexels.com/photos/6185751/pexels-photo-6185751.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  dimsum3: "https://images.pexels.com/photos/8093873/pexels-photo-8093873.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  dimsum4: "https://images.pexels.com/photos/8093956/pexels-photo-8093956.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  dimsum5: "https://images.pexels.com/photos/8093870/pexels-photo-8093870.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  noodle1: "https://images.pexels.com/photos/30676160/pexels-photo-30676160.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  noodle2: "https://images.pexels.com/photos/28895978/pexels-photo-28895978.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  noodle3: "https://images.pexels.com/photos/28895967/pexels-photo-28895967.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  noodle4: "https://images.pexels.com/photos/35479256/pexels-photo-35479256.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  noodle5: "https://images.pexels.com/photos/28895977/pexels-photo-28895977.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  soup1: "https://images.pexels.com/photos/37113522/pexels-photo-37113522.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  soup2: "https://images.pexels.com/photos/25325508/pexels-photo-25325508.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  soup3: "https://images.pexels.com/photos/16845652/pexels-photo-16845652.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  soup4: "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  rice1: "https://images.pexels.com/photos/34683317/pexels-photo-34683317.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  rice2: "https://images.pexels.com/photos/5720819/pexels-photo-5720819.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  rice3: "https://images.pexels.com/photos/28503589/pexels-photo-28503589.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  rice4: "https://images.pexels.com/photos/13065212/pexels-photo-13065212.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  curry1: "https://images.pexels.com/photos/5409016/pexels-photo-5409016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  curry2: "https://images.pexels.com/photos/5339079/pexels-photo-5339079.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  manch1: "https://images.pexels.com/photos/35071815/pexels-photo-35071815.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  manch2: "https://images.pexels.com/photos/35071822/pexels-photo-35071822.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  manch3: "https://images.pexels.com/photos/28674530/pexels-photo-28674530.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  combo: "https://images.pexels.com/photos/28445829/pexels-photo-28445829.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  combo2: "https://images.pexels.com/photos/28445828/pexels-photo-28445828.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  drink1: "https://images.pexels.com/photos/32612248/pexels-photo-32612248.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  drink2: "https://images.pexels.com/photos/33166521/pexels-photo-33166521.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  drink3: "https://images.pexels.com/photos/37981025/pexels-photo-37981025.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  drink4: "https://images.pexels.com/photos/12997014/pexels-photo-12997014.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  drink5: "https://images.pexels.com/photos/4523905/pexels-photo-4523905.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

export const CATEGORY_SEED = [
  { name: "Dim Sum", slug: "dim-sum", emoji: "🥟", image: IMG.dimsum1, description: "Hand-folded, steamed to order in bamboo baskets.", sortOrder: 1 },
  { name: "Noodles & Soups", slug: "noodles-soups", emoji: "🍜", image: IMG.noodle1, description: "Wok-tossed hakka noodles and slow-simmered broths.", sortOrder: 2 },
  { name: "Rice & Curry", slug: "rice-curry", emoji: "🍛", image: IMG.rice1, description: "Smoky fried rice paired with our signature gravies.", sortOrder: 3 },
  { name: "Drinks", slug: "drinks", emoji: "🥤", image: IMG.drink1, description: "Iced teas, coolers and bubble teas to refresh.", sortOrder: 4 },
  { name: "Snacks", slug: "snacks", emoji: "🍟", image: IMG.manch1, description: "Crispy starters and Indo-Chinese street favourites.", sortOrder: 5 },
];

type ProductSeed = {
  name: string; slug: string; description: string; ingredients: string; price: number;
  image: string; category: string; rating: number; reviewsCount: number; isFeatured?: boolean; isVeg?: boolean;
};

export const PRODUCT_SEED: ProductSeed[] = [
  // Dim Sum
  { name: "Chicken Steamed Momos", slug: "chicken-steamed-momos", category: "dim-sum", price: 149, rating: 4.8, reviewsCount: 212, isFeatured: true, image: IMG.dimsum3,
    description: "Eight juicy hand-pleated dumplings filled with minced chicken, ginger and spring onion, steamed in bamboo and served with fiery Khang chutney.",
    ingredients: "Chicken mince, refined flour, ginger, garlic, spring onion, sesame oil, soy, white pepper" },
  { name: "Veg Steamed Momos", slug: "veg-steamed-momos", category: "dim-sum", price: 119, rating: 4.6, reviewsCount: 168, isVeg: true, image: IMG.dimsum4,
    description: "Delicate dumplings stuffed with cabbage, carrot, mushroom and tofu — light, fragrant and perfectly steamed.",
    ingredients: "Cabbage, carrot, mushroom, tofu, refined flour, ginger, garlic, soy sauce" },
  { name: "Prawn Har Gow", slug: "prawn-har-gow", category: "dim-sum", price: 249, rating: 4.9, reviewsCount: 97, isFeatured: true, image: IMG.dimsum1,
    description: "Classic Cantonese crystal dumplings with whole prawns wrapped in translucent wheat-starch skin.",
    ingredients: "Prawns, bamboo shoot, wheat starch, tapioca starch, sesame oil, white pepper" },
  { name: "Pan-Fried Chicken Gyoza", slug: "pan-fried-chicken-gyoza", category: "dim-sum", price: 179, rating: 4.7, reviewsCount: 143, image: IMG.dimsum5,
    description: "Crispy-bottomed, steamed-topped gyoza with a savoury chicken and chive filling and black vinegar dip.",
    ingredients: "Chicken, chives, ginger, garlic, soy, refined flour, black vinegar" },
  { name: "Char Siu Bao", slug: "char-siu-bao", category: "dim-sum", price: 169, rating: 4.7, reviewsCount: 88, image: IMG.dimsum2,
    description: "Fluffy pillow-soft steamed buns filled with sweet & sticky honey-glazed barbecue chicken.",
    ingredients: "Refined flour, yeast, chicken, hoisin, honey, five spice, sesame" },
  { name: "Crispy Fried Wontons", slug: "crispy-fried-wontons", category: "dim-sum", price: 139, rating: 4.5, reviewsCount: 121, image: IMG.dimsum3,
    description: "Golden fried wontons stuffed with spiced chicken, served with sweet chilli sauce.",
    ingredients: "Chicken, wonton wrappers, garlic, spring onion, sweet chilli sauce" },

  // Noodles & Soups
  { name: "Chicken Hakka Noodles", slug: "chicken-hakka-noodles", category: "noodles-soups", price: 189, rating: 4.7, reviewsCount: 304, isFeatured: true, image: IMG.noodle3,
    description: "Wok-tossed hakka noodles with julienned vegetables and tender chicken, kissed by high wok-hei flame.",
    ingredients: "Hakka noodles, chicken, cabbage, capsicum, carrot, soy, garlic, spring onion" },
  { name: "Veg Hakka Noodles", slug: "veg-hakka-noodles", category: "noodles-soups", price: 149, rating: 4.5, reviewsCount: 221, isVeg: true, image: IMG.noodle5,
    description: "Classic street-style hakka noodles loaded with crunchy garden vegetables.",
    ingredients: "Hakka noodles, cabbage, capsicum, carrot, beans, soy, garlic, vinegar" },
  { name: "Schezwan Chicken Noodles", slug: "schezwan-chicken-noodles", category: "noodles-soups", price: 209, rating: 4.8, reviewsCount: 186, isFeatured: true, image: IMG.noodle2,
    description: "Bold, spicy noodles tossed in house-made Schezwan sauce with dried red chillies and chicken.",
    ingredients: "Noodles, chicken, schezwan sauce, red chilli, garlic, celery, spring onion" },
  { name: "Chilli Garlic Noodles", slug: "chilli-garlic-noodles", category: "noodles-soups", price: 169, rating: 4.6, reviewsCount: 139, isVeg: true, image: IMG.noodle1,
    description: "Springy noodles with crispy garlic, chilli oil and a hint of sesame — addictive comfort.",
    ingredients: "Noodles, garlic, chilli oil, sesame oil, soy, spring onion" },
  { name: "Beef Lo Mein", slug: "beef-lo-mein", category: "noodles-soups", price: 239, rating: 4.7, reviewsCount: 74, image: IMG.noodle4,
    description: "Silky egg noodles with sliced beef, bok choy and a glossy oyster-soy glaze.",
    ingredients: "Egg noodles, beef, bok choy, oyster sauce, soy, ginger, sesame" },
  { name: "Hot & Sour Soup", slug: "hot-sour-soup", category: "noodles-soups", price: 129, rating: 4.6, reviewsCount: 158, isVeg: true, image: IMG.soup2,
    description: "Peppery, tangy soup thick with mushroom, tofu, bamboo shoot and egg ribbons.",
    ingredients: "Mushroom, tofu, bamboo shoot, vinegar, white pepper, soy, cornflour" },
  { name: "Chicken Wonton Soup", slug: "chicken-wonton-soup", category: "noodles-soups", price: 159, rating: 4.8, reviewsCount: 112, image: IMG.soup1,
    description: "Clear ginger broth with delicate chicken wontons and fresh greens.",
    ingredients: "Chicken wontons, chicken stock, ginger, bok choy, spring onion, sesame oil" },
  { name: "Manchow Soup", slug: "manchow-soup", category: "noodles-soups", price: 139, rating: 4.5, reviewsCount: 97, isVeg: true, image: IMG.soup3,
    description: "Dark, spicy Indo-Chinese soup topped with a crunchy nest of fried noodles.",
    ingredients: "Vegetables, soy, garlic, chilli, coriander, fried noodles" },
  { name: "Dumpling Noodle Soup", slug: "dumpling-noodle-soup", category: "noodles-soups", price: 199, rating: 4.7, reviewsCount: 63, image: IMG.soup4,
    description: "A hearty bowl of noodles and pork-style chicken dumplings in aromatic broth.",
    ingredients: "Noodles, chicken dumplings, stock, scallion, chilli oil" },

  // Rice & Curry
  { name: "Chicken Fried Rice", slug: "chicken-fried-rice", category: "rice-curry", price: 179, rating: 4.7, reviewsCount: 341, isFeatured: true, image: IMG.rice2,
    description: "Smoky wok-fried rice with egg, chicken and spring onion — our best-seller for a reason.",
    ingredients: "Basmati rice, chicken, egg, spring onion, soy, garlic, pepper" },
  { name: "Prawn Fried Rice", slug: "prawn-fried-rice", category: "rice-curry", price: 229, rating: 4.8, reviewsCount: 128, image: IMG.rice1,
    description: "Plump prawns tossed with jasmine rice, egg and crisp vegetables.",
    ingredients: "Jasmine rice, prawns, egg, peas, carrot, soy, sesame oil" },
  { name: "Egg Fried Rice", slug: "egg-fried-rice", category: "rice-curry", price: 139, rating: 4.5, reviewsCount: 206, image: IMG.rice3,
    description: "Golden egg fried rice, simple and satisfying with a hint of white pepper.",
    ingredients: "Rice, egg, spring onion, soy, white pepper" },
  { name: "Veg Schezwan Fried Rice", slug: "veg-schezwan-fried-rice", category: "rice-curry", price: 159, rating: 4.6, reviewsCount: 174, isVeg: true, image: IMG.rice4,
    description: "Fiery Schezwan fried rice with garden vegetables and fresh coriander.",
    ingredients: "Rice, schezwan sauce, beans, carrot, capsicum, garlic, coriander" },
  { name: "Chicken Manchurian Gravy", slug: "chicken-manchurian-gravy", category: "rice-curry", price: 219, rating: 4.8, reviewsCount: 265, isFeatured: true, image: IMG.curry2,
    description: "Crispy chicken simmered in a rich garlic-soy Manchurian gravy — perfect with fried rice.",
    ingredients: "Chicken, garlic, ginger, soy, chilli, cornflour, spring onion" },
  { name: "Chilli Chicken Gravy", slug: "chilli-chicken-gravy", category: "rice-curry", price: 219, rating: 4.7, reviewsCount: 198, image: IMG.curry1,
    description: "Wok-fired chicken in a spicy chilli-capsicum sauce with onions.",
    ingredients: "Chicken, green chilli, capsicum, onion, soy, vinegar, garlic" },
  { name: "Kung Pao Chicken", slug: "kung-pao-chicken", category: "rice-curry", price: 249, rating: 4.8, reviewsCount: 91, image: IMG.curry1,
    description: "Sichuan classic with roasted peanuts, dried chillies and a sweet-spicy glaze.",
    ingredients: "Chicken, peanuts, dried chilli, sichuan pepper, soy, vinegar, sugar" },
  { name: "Noodle & Chilli Chicken Combo", slug: "noodle-chilli-chicken-combo", category: "rice-curry", price: 299, rating: 4.9, reviewsCount: 156, isFeatured: true, image: IMG.combo,
    description: "The Khang signature combo: hakka noodles paired with dry chilli chicken. A complete meal.",
    ingredients: "Hakka noodles, chicken, capsicum, chilli, soy, garlic" },
  { name: "Veg Manchurian Combo", slug: "veg-manchurian-combo", category: "rice-curry", price: 249, rating: 4.6, reviewsCount: 133, isVeg: true, image: IMG.combo2,
    description: "Vegetable noodles served with saucy veg Manchurian balls.",
    ingredients: "Noodles, cabbage, carrot, garlic, soy, cornflour" },

  // Drinks
  { name: "Iced Lemon Tea", slug: "iced-lemon-tea", category: "drinks", price: 79, rating: 4.5, reviewsCount: 143, isVeg: true, image: IMG.drink3,
    description: "Chilled black tea with fresh lime and a touch of honey.",
    ingredients: "Black tea, lime, honey, ice" },
  { name: "Classic Milk Bubble Tea", slug: "classic-milk-bubble-tea", category: "drinks", price: 129, rating: 4.7, reviewsCount: 211, isFeatured: true, isVeg: true, image: IMG.drink2,
    description: "Creamy milk tea with chewy brown-sugar tapioca pearls.",
    ingredients: "Milk, black tea, tapioca pearls, brown sugar" },
  { name: "Mango Cooler", slug: "mango-cooler", category: "drinks", price: 99, rating: 4.6, reviewsCount: 87, isVeg: true, image: IMG.drink1,
    description: "Fresh mango pulp blended with soda and mint over crushed ice.",
    ingredients: "Mango, soda, mint, lime, ice" },
  { name: "Lychee Iced Tea", slug: "lychee-iced-tea", category: "drinks", price: 99, rating: 4.6, reviewsCount: 76, isVeg: true, image: IMG.drink4,
    description: "Floral lychee infused iced tea — light and refreshing.",
    ingredients: "Lychee, green tea, sugar syrup, ice" },
  { name: "Jasmine Green Tea (Hot)", slug: "jasmine-green-tea", category: "drinks", price: 69, rating: 4.4, reviewsCount: 54, isVeg: true, image: IMG.drink5,
    description: "Traditional jasmine-scented green tea served in a pot.",
    ingredients: "Jasmine green tea leaves" },

  // Snacks
  { name: "Dry Chilli Chicken", slug: "dry-chilli-chicken", category: "snacks", price: 199, rating: 4.8, reviewsCount: 287, isFeatured: true, image: IMG.manch2,
    description: "Crispy chicken bites tossed with green chillies, capsicum and onion in a tangy glaze.",
    ingredients: "Chicken, green chilli, capsicum, onion, soy, vinegar" },
  { name: "Veg Spring Rolls", slug: "veg-spring-rolls", category: "snacks", price: 129, rating: 4.5, reviewsCount: 164, isVeg: true, image: IMG.manch3,
    description: "Crunchy golden rolls filled with seasoned vegetables and glass noodles.",
    ingredients: "Spring roll sheets, cabbage, carrot, glass noodles, soy" },
  { name: "Chicken Lollipop", slug: "chicken-lollipop", category: "snacks", price: 219, rating: 4.8, reviewsCount: 232, image: IMG.manch1,
    description: "Six frenched drumettes, marinated overnight and fried crisp, served with Schezwan dip.",
    ingredients: "Chicken wings, ginger-garlic, red chilli, soy, cornflour" },
  { name: "Gobi Manchurian Dry", slug: "gobi-manchurian-dry", category: "snacks", price: 149, rating: 4.6, reviewsCount: 198, isVeg: true, image: IMG.manch3,
    description: "Crispy cauliflower florets tossed in a sticky garlic Manchurian sauce.",
    ingredients: "Cauliflower, garlic, soy, chilli, spring onion, cornflour" },
  { name: "Honey Chilli Potato", slug: "honey-chilli-potato", category: "snacks", price: 139, rating: 4.7, reviewsCount: 176, isVeg: true, image: IMG.manch3,
    description: "Crispy potato fingers glazed with honey, chilli and toasted sesame.",
    ingredients: "Potato, honey, chilli, sesame, garlic, soy" },
  { name: "Salt & Pepper Prawns", slug: "salt-pepper-prawns", category: "snacks", price: 269, rating: 4.9, reviewsCount: 68, image: IMG.manch2,
    description: "Lightly battered prawns wok-tossed with garlic, chilli and cracked black pepper.",
    ingredients: "Prawns, garlic, chilli, black pepper, cornflour, spring onion" },
];

const REVIEW_SEED = [
  { name: "Priya S.", rating: 5, comment: "The chicken momos are the best in town. Juicy, hot and that chutney is unreal!" },
  { name: "Arjun M.", rating: 5, comment: "Ordered the noodle & chilli chicken combo — arrived hot in 30 minutes. Perfect wok flavour." },
  { name: "Fathima R.", rating: 4, comment: "Loved the Har Gow. Authentic dim sum, delicate skins. Will order again." },
  { name: "Rahul K.", rating: 5, comment: "Khang's Schezwan noodles have the perfect kick. Packaging was great too." },
  { name: "Meera D.", rating: 5, comment: "Beautiful ambiance and the bubble tea is so creamy. Highly recommend!" },
  { name: "Sultan A.", rating: 4, comment: "Chicken lollipop was crispy and juicy. Delivery tracking worked flawlessly." },
];

let seedPromise: Promise<void> | null = null;

export function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

/** Advisory-lock key so only ONE serverless instance bootstraps at a time. */
const BOOTSTRAP_LOCK = 0x4b48414e; // "KHAN"

/**
 * Creates every table and seeds the menu + admin account the first time the
 * app touches a FRESH database (no manual SQL needed), inside ONE locked
 * transaction. Against an already-set-up database every step is a no-op.
 */
async function seed() {
  await db.transaction(async (tx) => {
    // Take a transaction-scoped advisory lock: concurrent serverless instances
    // wait here instead of racing the CREATE TABLE / seed inserts.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${BOOTSTRAP_LOCK})`);

    // 1 · Create the schema (same DDL as supabase/migrations/*).
    for (const statement of SCHEMA_STATEMENTS) {
      await tx.execute(sql.raw(statement));
    }

    // 2 · Seed the menu on first boot.
    const [{ value: catCount }] = await tx.select({ value: count() }).from(categories);
    if (Number(catCount) === 0) {
      const inserted = await tx.insert(categories).values(CATEGORY_SEED).returning();
      const bySlug = new Map(inserted.map((c) => [c.slug, c.id]));
      await tx.insert(products).values(
        PRODUCT_SEED.map((p) => ({
          name: p.name,
          slug: p.slug,
          description: p.description,
          ingredients: p.ingredients,
          price: p.price,
          image: p.image,
          categoryId: bySlug.get(p.category)!,
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          isFeatured: !!p.isFeatured,
          isVeg: !!p.isVeg,
        })),
      );
    }

    const [{ value: reviewCount }] = await tx.select({ value: count() }).from(reviews);
    if (Number(reviewCount) === 0) {
      await tx.insert(reviews).values(REVIEW_SEED.map((r) => ({ ...r, productId: null })));
    }

    // 3 · Admin account (override with ADMIN_EMAIL / ADMIN_PASSWORD env vars).
    const [{ value: userCount }] = await tx.select({ value: count() }).from(users);
    if (Number(userCount) === 0) {
      await tx.insert(users).values({
        name: "Khang Admin",
        email: process.env.ADMIN_EMAIL || "admin@khang.com",
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10),
        role: "admin",
        phone: "+91 90000 00000",
      });
    }
  });
}

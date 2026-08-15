import { PrismaClient, Role, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Idols", slug: "idols", description: "Handcrafted deity idols in brass, marble, and panchdhatu." },
  { name: "Rudraksha", slug: "rudraksha", description: "Certified natural Rudraksha beads and malas." },
  { name: "Puja Samagri", slug: "puja-samagri", description: "Everything needed for daily and festival puja." },
  { name: "Malas", slug: "malas", description: "Tulsi, crystal, and Sphatik malas for japa and wear." },
  { name: "Yantras", slug: "yantras", description: "Sacred geometric yantras for prosperity and protection." },
  { name: "Incense & Dhoop", slug: "incense-dhoop", description: "Natural incense sticks, dhoop cones, and camphor." },
  { name: "Diyas & Temple Accessories", slug: "diyas-temple-accessories", description: "Brass diyas, bells, and home temple essentials." },
  { name: "Spiritual Jewelry", slug: "spiritual-jewelry", description: "Rudraksha and gemstone jewelry." },
  { name: "Books", slug: "books", description: "Spiritual texts, scriptures, and guides." },
  { name: "Gift Boxes", slug: "gift-boxes", description: "Curated spiritual gift sets for every occasion." },
];

const PRODUCTS: Array<{
  title: string;
  slug: string;
  sku: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  shortDesc: string;
  material: string;
  usageInfo: string;
  careInfo: string;
  inventory: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  image: string;
}> = [
  {
    title: "Brass Ganesha Idol – Hand Engraved",
    slug: "brass-ganesha-idol-hand-engraved",
    sku: "IDL-GAN-001",
    categorySlug: "idols",
    price: 1899,
    compareAtPrice: 2499,
    description:
      "A finely hand-engraved brass Ganesha idol, cast using traditional lost-wax methods by artisans in Moradabad. Ideal for home temples, housewarmings, and festive gifting. Each piece carries subtle variations that reflect its handmade origin.",
    shortDesc: "Hand-engraved brass Ganesha idol for home temples.",
    material: "Solid Brass",
    usageInfo: "Traditionally placed at the entrance or home altar to invoke auspicious beginnings and remove obstacles.",
    careInfo: "Wipe with a dry soft cloth. Avoid water and harsh chemicals. Occasional brass polish restores shine.",
    inventory: 42,
    isFeatured: true,
    isBestSeller: true,
    image: "https://images.unsplash.com/photo-1621252179027-94459d278660?w=800",
  },
  {
    title: "5 Mukhi Rudraksha Mala – 108 Beads",
    slug: "5-mukhi-rudraksha-mala-108-beads",
    sku: "RUD-5M-108",
    categorySlug: "rudraksha",
    price: 999,
    compareAtPrice: 1299,
    description:
      "A certified 5 Mukhi (five-faced) Rudraksha mala strung with 108 beads sourced from Nepal, associated with Lord Shiva and used widely for daily japa and meditation practice.",
    shortDesc: "Certified 108-bead 5 Mukhi Rudraksha mala from Nepal.",
    material: "Natural Rudraksha Seed",
    usageInfo: "Worn for meditation and japa; believed to support calm and focus during practice.",
    careInfo: "Keep away from perfumes and water. Oil lightly once a year with sandalwood or almond oil.",
    inventory: 76,
    isBestSeller: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1610375461369-d613b564f4c4?w=800",
  },
  {
    title: "Panchdhatu Puja Thali Set",
    slug: "panchdhatu-puja-thali-set",
    sku: "PJS-THL-001",
    categorySlug: "puja-samagri",
    price: 1499,
    description:
      "A complete puja thali set cast in panchdhatu (five sacred metals), including diya, bell, kalash, incense holder, and kumkum containers — everything needed for daily worship.",
    shortDesc: "Complete 7-piece panchdhatu puja thali set.",
    material: "Panchdhatu (five-metal alloy)",
    usageInfo: "Used for daily aarti and festival puja rituals.",
    careInfo: "Hand wash gently and dry immediately to prevent tarnishing.",
    inventory: 30,
    isNewArrival: true,
    image: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=800",
  },
  {
    title: "Tulsi Mala – Double Line 108 Beads",
    slug: "tulsi-mala-double-line-108-beads",
    sku: "MAL-TUL-002",
    categorySlug: "malas",
    price: 349,
    compareAtPrice: 499,
    description:
      "A traditional double-line Tulsi (holy basil) mala with 108 hand-rounded beads, grown and crafted in Vrindavan. Widely worn by Vaishnav practitioners for daily chanting.",
    shortDesc: "Vrindavan-crafted double-line Tulsi mala, 108 beads.",
    material: "Tulsi Wood",
    usageInfo: "Worn daily or used for japa; associated with devotion to Vishnu and Krishna.",
    careInfo: "Avoid prolonged water contact. Store in a soft pouch when not worn.",
    inventory: 120,
    isBestSeller: true,
    image: "https://images.unsplash.com/photo-1611329532992-0b7ee3d3d5e5?w=800",
  },
  {
    title: "Sphatik (Crystal) Mala – 108 Beads, 8mm",
    slug: "sphatik-crystal-mala-108-beads-8mm",
    sku: "MAL-SPH-008",
    categorySlug: "malas",
    price: 799,
    description:
      "A clear natural Sphatik (quartz crystal) mala with 108 uniformly cut 8mm beads, valued for its cooling properties and used in meditation and Lakshmi puja.",
    shortDesc: "Natural 8mm Sphatik crystal mala, 108 beads.",
    material: "Natural Quartz Crystal",
    usageInfo: "Used for japa, meditation, and Sri Yantra/Lakshmi worship on Fridays.",
    careInfo: "Clean with a soft dry cloth; avoid dropping as crystal can chip.",
    inventory: 58,
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800",
  },
  {
    title: "Sri Yantra – Copper, 4 Inch",
    slug: "sri-yantra-copper-4-inch",
    sku: "YNT-SRI-004",
    categorySlug: "yantras",
    price: 649,
    description:
      "A precisely etched 4-inch copper Sri Yantra, one of the most revered geometric yantras, traditionally placed in home temples or workspaces to invoke prosperity and balance.",
    shortDesc: "Precision-etched copper Sri Yantra, 4 inch.",
    material: "Copper",
    usageInfo: "Placed facing east on a clean altar; often worshipped alongside Lakshmi puja.",
    careInfo: "Wipe with a dry cloth; copper may naturally patina over time.",
    inventory: 25,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1601049544103-1f9d9e2b0f9e?w=800",
  },
  {
    title: "Natural Sandalwood Incense Sticks – Pack of 100",
    slug: "natural-sandalwood-incense-sticks-pack-100",
    sku: "INC-SDL-100",
    categorySlug: "incense-dhoop",
    price: 249,
    description:
      "Hand-rolled sandalwood incense sticks made from natural resins and sandalwood powder, free from synthetic charcoal fragrance, for daily puja and meditation ambience.",
    shortDesc: "Hand-rolled natural sandalwood incense, pack of 100.",
    material: "Natural sandalwood powder & resin",
    usageInfo: "Light before puja or meditation for a calming, traditional fragrance.",
    careInfo: "Store in a dry, airtight place away from direct sunlight.",
    inventory: 200,
    isBestSeller: true,
    image: "https://images.unsplash.com/photo-1602607203959-1d0e9c3b0e0c?w=800",
  },
  {
    title: "Brass Diya Pair – Peacock Design",
    slug: "brass-diya-pair-peacock-design",
    sku: "DIY-PEA-002",
    categorySlug: "diyas-temple-accessories",
    price: 599,
    description:
      "A pair of intricately designed brass diyas featuring peacock motifs, perfect for daily aarti, Diwali decor, and home temple use.",
    shortDesc: "Peacock-motif brass diya pair for daily aarti.",
    material: "Brass",
    usageInfo: "Filled with ghee or oil and lit during aarti and festivals.",
    careInfo: "Clean residue after each use; polish occasionally to maintain shine.",
    inventory: 90,
    isNewArrival: true,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
  },
  {
    title: "Rudraksha Bracelet – 6mm Beads with Silver Cap",
    slug: "rudraksha-bracelet-6mm-silver-cap",
    sku: "JWL-RBS-006",
    categorySlug: "spiritual-jewelry",
    price: 549,
    description:
      "An elegant everyday Rudraksha bracelet with 6mm beads finished with silver-capped accents, combining spiritual significance with wearable style.",
    shortDesc: "6mm Rudraksha bracelet with silver-capped accents.",
    material: "Rudraksha & Sterling Silver",
    usageInfo: "Worn daily on the wrist as a reminder of spiritual practice.",
    careInfo: "Remove before bathing or swimming; store away from moisture.",
    inventory: 65,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
  },
  {
    title: "Diwali Gift Box – Idol, Diya & Incense Set",
    slug: "diwali-gift-box-idol-diya-incense-set",
    sku: "GFT-DIW-001",
    categorySlug: "gift-boxes",
    price: 1299,
    compareAtPrice: 1699,
    description:
      "A curated Diwali gift box featuring a small brass Lakshmi-Ganesha idol, a pair of diyas, and premium incense — beautifully packaged and ready to gift.",
    shortDesc: "Curated Diwali gift box with idol, diyas & incense.",
    material: "Mixed (Brass, Wax, Natural Incense)",
    usageInfo: "Ideal for Diwali gifting to family, friends, or colleagues.",
    careInfo: "See individual item care instructions inside the box insert.",
    inventory: 40,
    isFeatured: true,
    isNewArrival: true,
    image: "https://images.unsplash.com/photo-1605633998645-63f8c0c6c17e?w=800",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("ChangeMe123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@divinestore.in" },
    update: {},
    create: {
      email: "admin@divinestore.in",
      name: "Store Admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin user ready (admin@divinestore.in / ChangeMe123!) — change this password immediately.");

  // Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isFeatured: true },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`✅ Seeded ${CATEGORIES.length} categories`);

  // Products
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        shortDesc: p.shortDesc,
        status: ProductStatus.PUBLISHED,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        material: p.material,
        usageInfo: p.usageInfo,
        careInfo: p.careInfo,
        inventory: p.inventory,
        categoryId: categoryMap[p.categorySlug],
        isFeatured: !!p.isFeatured,
        isBestSeller: !!p.isBestSeller,
        isNewArrival: !!p.isNewArrival,
        metaTitle: p.title,
        metaDescription: p.shortDesc,
        tags: [p.categorySlug],
      },
    });

    await prisma.productImage.upsert({
      where: { id: `${product.id}-primary` },
      update: {},
      create: {
        id: `${product.id}-primary`,
        productId: product.id,
        url: p.image,
        altText: p.title,
        sortOrder: 0,
      },
    });
  }
  console.log(`✅ Seeded ${PRODUCTS.length} products`);

  // A couple of coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 499,
      maxDiscount: 300,
      isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      description: "Free shipping over ₹999",
      discountType: "FIXED",
      discountValue: 79,
      minOrderValue: 999,
      isActive: true,
    },
  });
  console.log("✅ Seeded coupons");

  // Festival / event banners for the homepage
  const now = new Date();
  const in20Days = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
  const in45Days = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

  await prisma.festival.createMany({
    data: [
      {
        title: "Diwali Collection is Live",
        subtitle: "Idols, diyas, and gift boxes curated for the festival of lights.",
        discountText: "Up to 25% off",
        image: null,
        ctaLabel: "Shop Diwali",
        ctaLink: "/category/gift-boxes",
        startDate: now,
        endDate: in20Days,
        isActive: true,
        sortOrder: 0,
      },
      {
        title: "Navratri Puja Essentials",
        subtitle: "Everything you need for nine nights of worship, in one place.",
        discountText: "Flat ₹150 off puja samagri sets",
        image: null,
        ctaLabel: "Shop Puja Samagri",
        ctaLink: "/category/puja-samagri",
        startDate: now,
        endDate: in45Days,
        isActive: true,
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Seeded festival banners");

  console.log("🌱 Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

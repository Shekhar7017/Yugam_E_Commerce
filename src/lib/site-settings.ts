export type SiteSettings = {
  storeName: string;
  logoUrl: string;
  footerTagline: string;
  heroBadgeText: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  heroCtaLabel: string;
  heroCtaLink: string;
  whyChooseUs: { title: string; description: string }[];
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string; // format: countrycode+number, e.g. "919876543210" — no spaces, no +
};

export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: "Divine Store",
  logoUrl: " ",
  footerTagline: "Handpicked idols, malas, and puja essentials, curated with care for your everyday devotion.",
  heroBadgeText: "Sacred • Handpicked • Delivered",
  heroHeading: "Bring devotion home",
  heroSubheading: "Idols, malas, and puja essentials curated for the modern spiritual home.",
  heroImage: "",
  heroCtaLabel: "Shop the Collection",
  heroCtaLink: "/category/idols",
  whyChooseUs: [
    { title: "Authentic & Certified", description: "Every Rudraksha and gemstone is verified for authenticity." },
    { title: "Handcrafted with Care", description: "Sourced directly from artisan communities across India." },
    { title: "Pan-India Delivery", description: "Safely packaged and delivered to your doorstep, anywhere in India." },
  ],
  contactEmail: "support@divinestore.in",
  contactPhone: "",
  whatsappNumber: "",
};
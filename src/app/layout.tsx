import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { DivineAssistant } from "@/components/ai/divine-assistant";
import { Toaster } from "sonner";
import { getSiteSettings } from "@/actions/settings.actions";


const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: `${settings.storeName} — Sacred Products for Everyday Devotion`,
      template: `%s | ${settings.storeName}`,
    },
    description:
      "Premium idols, Rudraksha, malas, yantras, puja samagri and spiritual gifts — handpicked and delivered across India.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),

    icons:{
      icon: "/fevicon.ico",
    },
    openGraph: {
      title: settings.storeName,
      description: "Sacred products for everyday devotion.",
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} font-sans`}>
        <Providers>
          <Navbar storeName={settings.storeName} />
          <main className="min-h-screen">{children}</main>
          <Footer storeName={settings.storeName} tagline={settings.footerTagline} />
          <DivineAssistant />
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}




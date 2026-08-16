"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Festival = {
  id: string;
  title: string;
  subtitle: string | null;
  discountText: string | null;
  image: string | null;
  ctaLabel: string;
  ctaLink: string;
  hasTextOverlay: boolean;
  endDate: Date | string | null;
};

type Settings = {
  heroBadgeText: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  heroCtaLabel: string;
  heroCtaLink: string;
};

type Slide = {
  badge: string;
  heading: string;
  subheading: string;
  image: string;
  ctaLabel: string;
  ctaLink: string;
  hasTextOverlay: boolean;
  endDate?: Date | string | null;
};

export function HeroSlideshow({ settings, festivals }: { settings: Settings; festivals: Festival[] }) {
  const slides: Slide[] = [
    {
      badge: settings.heroBadgeText,
      heading: settings.heroHeading,
      subheading: settings.heroSubheading,
      image: settings.heroImage,
      ctaLabel: settings.heroCtaLabel,
      ctaLink: settings.heroCtaLink,
      hasTextOverlay: true,
    },
    ...festivals.map((f) => ({
      badge: f.discountText ?? "Limited Time",
      heading: f.title,
      subheading: f.subtitle ?? "",
      image: f.image ?? settings.heroImage,
      ctaLabel: f.ctaLabel,
      ctaLink: f.ctaLink,
      hasTextOverlay: f.hasTextOverlay,
      endDate: f.endDate,
    })),
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <section className="relative h-[70vh] min-h-[480px] overflow-hidden bg-secondary">
      {slides.map((slide, i) => (
        <HeroSlide key={i} slide={slide} active={i === index} />
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function HeroSlide({ slide, active }: { slide: Slide; active: boolean }) {
  const countdown = useCountdown(slide.endDate);
  const visibility = active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none";

  const background = slide.image && (
    <Image src={slide.image} alt={slide.heading} fill priority={active} className="object-cover brightness-[0.55]" />
  );

  // Image-only banner: the whole slide is one clickable link, since there's
  // no separate button — all the messaging is already baked into the image.
  if (!slide.hasTextOverlay) {
    return (
      <Link href={slide.ctaLink} className={`absolute inset-0 transition-opacity duration-700 ${visibility}`}>
        {background}
      </Link>
    );
  }

  return (
    <div className={`absolute inset-0 transition-opacity duration-700 ${visibility}`}>
      {background}
      <div className="absolute inset-0 flex items-center">
        <div className="container">
          <div className="max-w-xl text-left text-white">
            {slide.badge && <p className="uppercase tracking-[0.3em] text-xs mb-4 text-marigold">{slide.badge}</p>}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight text-balance">{slide.heading}</h1>
            {slide.subheading && <p className="mt-4 opacity-90 text-sm sm:text-base">{slide.subheading}</p>}
            {countdown && <p className="mt-2 text-xs tracking-wide opacity-80">Ends in {countdown}</p>}
            <Link
              href={slide.ctaLink}
              className="inline-block mt-8 bg-accent text-accent-foreground px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              {slide.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function useCountdown(endDate?: Date | string | null) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!endDate) {
      setText(null);
      return;
    }
    const target = new Date(endDate).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setText(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setText(days > 0 ? `${days}d ${hours}h` : `${hours}h`);
    };

    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [endDate]);

  return text;
}
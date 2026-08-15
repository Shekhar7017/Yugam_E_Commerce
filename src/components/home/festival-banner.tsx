"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Festival = {
  id: string;
  title: string;
  subtitle: string | null;
  discountText: string | null;
  image: string | null;
  ctaLabel: string;
  ctaLink: string;
  endDate: Date | string | null;
};

export function FestivalBanner({ festivals }: { festivals: Festival[] }) {
  if (festivals.length === 0) return null;

  return (
    <section className="w-full overflow-x-auto snap-x snap-mandatory flex scrollbar-hide">
      {festivals.map((f) => (
        <FestivalSlide key={f.id} festival={f} single={festivals.length === 1} />
      ))}
    </section>
  );
}

function FestivalSlide({ festival, single }: { festival: Festival; single: boolean }) {
  const countdown = useCountdown(festival.endDate);

  return (
    <Link
      href={festival.ctaLink}
      className={`relative shrink-0 snap-start min-h-[220px] sm:min-h-[200px] md:h-56 flex items-center overflow-hidden ${
        single ? "w-full" : "w-full md:w-full"
      }`}
      style={{
        backgroundImage: festival.image ? `url(${festival.image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: !festival.image ? "hsl(var(--secondary))" : undefined,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/75 via-black/45 sm:via-black/40 to-black/20 sm:to-transparent" />

      <div className="relative z-10 container flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-white gap-4 py-5">
        <div className="min-w-0">
          {festival.discountText && (
            <span className="inline-block bg-accent text-accent-foreground text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
              {festival.discountText}
            </span>
          )}
          <h2 className="font-display text-xl sm:text-2xl md:text-4xl leading-tight">
            {festival.title}
          </h2>
          {festival.subtitle && (
            <p className="text-xs sm:text-sm md:text-base opacity-90 mt-1 max-w-md line-clamp-2">
              {festival.subtitle}
            </p>
          )}
          {countdown && (
            <p className="text-[11px] sm:text-xs md:text-sm mt-2 opacity-80 tracking-wide">
              Ends in {countdown}
            </p>
          )}
        </div>

        <span className="inline-flex self-start sm:self-auto bg-white text-secondary px-4 py-2 sm:px-5 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium shrink-0">
          {festival.ctaLabel}
        </span>
      </div>
    </Link>
  );
}

function useCountdown(endDate: Date | string | null) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!endDate) return;
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
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  bg: string;
  cta: string;
  href: string;
  image?: string;
  showOverlay?: boolean;
};

// Pehla wala Daraz-style slider layout,
// lekin ab optionally aapke apne images (public/banners/...) bhi use karega.
const SLIDES: Slide[] = [
  {
    id: 1,
    title: "Mega Flash Sale",
    subtitle: "Up to 60% off on top picks",
    bg: "linear-gradient(135deg,#f57224 0%,#e5611a 100%)",
    image: "/banners/image 1.avif",
    showOverlay: false,
    cta: "Shop Flash Sale",
    href: "/?flash=1",
  },
  {
    id: 2,
    title: "Electronics",
    subtitle: "Latest gadgets & devices",
    bg: "linear-gradient(135deg,#232f3e 0%,#37475a 100%)",
    image: "/banners/image 2.avif",
    showOverlay: false,
    cta: "Explore Electronics",
    href: "/?category=electronics",
  },
  {
    id: 3,
    title: "New Season Fashion",
    subtitle: "Fresh styles for everyone",
    bg: "linear-gradient(135deg,#2874f0 0%,#1a5bb8 100%)",
    image: "/banners/image 3.avif",
    showOverlay: false,
    cta: "Shop Fashion",
    href: "/?category=women's clothing",
  },
];

export default function Slider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 rounded-lg overflow-hidden">
      <div className="relative h-48 sm:h-56 md:h-72 lg:h-80 rounded-lg overflow-hidden">
        {SLIDES.map((s, i) => (
          <Link
            key={s.id}
            href={s.href}
            className="absolute inset-0 transition-opacity duration-500 flex items-center justify-center"
            style={{
              opacity: i === index ? 1 : 0,
              pointerEvents: i === index ? "auto" : "none",
              background: s.image ? undefined : s.bg,
              backgroundImage: s.image ? `url(${s.image})` : s.bg,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {s.showOverlay !== false && (
              <div className="text-center text-white px-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {s.title}
                </h2>
                <p className="text-lg opacity-90 mt-1">{s.subtitle}</p>
                <span className="inline-block mt-4 bg-white text-gray-800 font-semibold px-6 py-2 rounded-md hover:bg-gray-100 transition-colors">
                  {s.cta}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

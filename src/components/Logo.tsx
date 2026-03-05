"use client";

import Image from "next/image";
import { useState } from "react";

const LogoCartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function Logo({ className = "", variant = "orange" }: { className?: string; variant?: "white" | "orange" }) {
  const [trolleyImgError, setTrolleyImgError] = useState(false);
  const isWhite = variant === "white";
  const textClass = isWhite
    ? "text-white drop-shadow-sm"
    : "text-[#ff8c00]";
  const iconClass = isWhite
    ? "text-white"
    : "text-[#b84a00]";

  return (
    <div className={`flex items-center justify-center gap-0.5 ${isWhite ? "text-white" : ""} ${className}`} aria-hidden>
      <span className={`font-black text-lg md:text-xl tracking-tight ${textClass}`}>ON</span>
      {trolleyImgError ? (
        <LogoCartIcon className={`w-6 h-6 md:w-7 md:h-7 flex-shrink-0 -mx-0.5 ${iconClass}`} />
      ) : (
        <Image
          src="/trolley-icon.png"
          alt=""
          width={32}
          height={32}
          className="h-7 w-7 md:h-8 md:w-8 object-contain flex-shrink-0 -mx-0.5"
          style={{ filter: isWhite ? "brightness(0) invert(1)" : "contrast(1.15) brightness(0.9)" }}
          role="presentation"
          onError={() => setTrolleyImgError(true)}
        />
      )}
      <span className={`font-black text-lg md:text-xl tracking-tight ${textClass}`}>art</span>
    </div>
  );
}

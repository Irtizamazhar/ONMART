"use client";

import type { ReactNode } from "react";

export default function ApplyPageRoot({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen flex flex-col seller-apply-page bg-slate-900">
      {children}
    </section>
  );
}

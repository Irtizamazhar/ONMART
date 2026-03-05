"use client";

import { useState, useEffect } from "react";

/**
 * Only show loader after loading has been true for at least delayMs.
 * Fast responses (< 350ms) never show the loader – content appears directly.
 */
export function useDelayedLoader(loading: boolean, delayMs: number = 200): boolean {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowLoader(false);
      return;
    }
    const id = setTimeout(() => setShowLoader(true), delayMs);
    return () => clearTimeout(id);
  }, [loading, delayMs]);

  return loading && showLoader;
}

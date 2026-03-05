import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "slide-down": "slide-down 0.2s ease-out forwards",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        orange: {
          DEFAULT: "var(--daraz-orange)",
          dark: "var(--daraz-orange-dark)",
          light: "var(--daraz-orange-light)",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
        "card-hover": "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
      },
      borderRadius: {
        card: "0.75rem",
        "card-lg": "1rem",
      },
      transitionDuration: {
        200: "200ms",
        250: "250ms",
        400: "400ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;

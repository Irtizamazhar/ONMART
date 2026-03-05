import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Onmart – Online Shopping in Pakistan | Fashion, Electronics & Groceries",
  description: "Onmart – Shop for fashion, electronics, groceries and more.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen bg-[var(--background)]`}>
        <CartProvider>
          <AuthProvider>
            <LanguageProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </LanguageProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}

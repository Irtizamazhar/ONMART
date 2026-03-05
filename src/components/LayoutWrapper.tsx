"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = typeof pathname === "string" && (pathname === "/admin" || pathname.startsWith("/admin/"));
  const isAuthPage = typeof pathname === "string" && (pathname === "/forgot-password" || pathname === "/reset-password");
  const isSellerApplyPage = typeof pathname === "string" && pathname === "/sell/apply";

  if (isAdminRoute || isAuthPage || isSellerApplyPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 page-load-wrap w-full min-w-0 overflow-x-hidden">{children}</div>
      <Footer />
      <LoginModal />
      <SignupModal />
    </>
  );
}

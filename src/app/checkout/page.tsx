"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { getProductDisplayTitle } from "@/lib/displayName";
import { fetchProductById } from "@/services/api";
import Loader from "@/components/Loader";
import { useDelayedLoader } from "@/hooks/useDelayedLoader";

const DELIVERY_FEE = 130;

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { customerUser, isReady, openSignupModal } = useAuth();
  const { items: cartItems, totalPrice: cartTotalPrice, clearCart } = useCart();
  const { language } = useLanguage();
  const buyNow = searchParams.get("buyNow") === "1";
  const fromCart = searchParams.get("fromCart") === "1";
  const productId = searchParams.get("productId");
  const qtyParam = searchParams.get("qty");
  const qty = Math.max(1, parseInt(qtyParam || "1", 10) || 1);

  const [product, setProduct] = useState<{
    id: number | string;
    title: string;
    titleTranslations?: Record<string, string>;
    price: number;
    image: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const showLoader = useDelayedLoader(loading, 200);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [building, setBuilding] = useState("");
  const [colony, setColony] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    if (customerUser?.name) setFullName(customerUser.name);
    if (customerUser?.email && !customerUser?.name) setFullName("");
  }, [customerUser]);

  useEffect(() => {
    if (!isReady || customerUser) return;
    const returnUrl = "/checkout?" + searchParams.toString();
    openSignupModal(returnUrl);
  }, [isReady, customerUser, searchParams, openSignupModal]);

  useEffect(() => {
    if (!buyNow || !productId) {
      if (fromCart) setLoading(false);
      else setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const isNumericId = /^\d+$/.test(String(productId));
    const isDbProductId = !isNumericId;
    if (isDbProductId) {
      fetch(`/api/store/products?id=${encodeURIComponent(productId)}`)
        .then((r) => {
          if (r.status === 404) return null;
          return r.json();
        })
        .then((p: { id: string; title: string; titleTranslations?: Record<string, string>; price: number; image: string } | null) => {
          if (cancelled) return;
          if (p) setProduct({ id: p.id, title: p.title, titleTranslations: p.titleTranslations, price: Number(p.price), image: p.image || "/placeholder.png" });
          else setProduct(null);
        })
        .catch(() => { if (!cancelled) setProduct(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      fetchProductById(String(productId))
        .then((data) => { if (!cancelled) setProduct({ id: data.id, title: data.title, titleTranslations: (data as { titleTranslations?: Record<string, string> }).titleTranslations, price: Number(data.price), image: data.image || "/placeholder.png" }); })
        .catch(() => { if (!cancelled) setProduct(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }
    return () => { cancelled = true; };
  }, [buyNow, productId]);

  if (!fromCart && (!buyNow || !productId)) {
    return (
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-10 text-center">
        <p className="text-slate-600 mb-4">Invalid checkout. Use Buy Now from a product page or Proceed to Checkout from Cart.</p>
        <Link href="/" className="text-[#f57224] font-semibold hover:underline">Continue shopping</Link>
      </main>
    );
  }

  if (!fromCart && (loading || !product)) {
    return (
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-10">
        {loading ? (showLoader ? <Loader /> : (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-9 h-9 border-2 border-slate-200 border-t-[#f57224] rounded-full animate-spin" />
          </div>
        )) : (
          <div className="text-center">
            <p className="text-slate-600 mb-4">Product not found.</p>
            <Link href="/" className="text-[#f57224] font-semibold hover:underline">Continue shopping</Link>
          </div>
        )}
      </main>
    );
  }

  if (fromCart && cartItems.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-10 text-center">
        <p className="text-slate-600 mb-4">Your cart is empty.</p>
        <Link href="/cart" className="text-[#f57224] font-semibold hover:underline">View cart</Link>
        <span className="text-slate-400 mx-2">|</span>
        <Link href="/" className="text-[#f57224] font-semibold hover:underline">Continue shopping</Link>
      </main>
    );
  }

  const email = customerUser?.email || guestEmail.trim();
  const price = Number(product?.price) || 0;
  const itemsTotal = fromCart ? cartTotalPrice : price * qty;
  const total = itemsTotal + DELIVERY_FEE;
  const totalQty = fromCart ? cartItems.reduce((s, i) => s + i.quantity, 0) : qty;
  const orderItems = fromCart
    ? cartItems.map((i) => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, image: i.image }))
    : product ? [{ id: product.id, title: product.title, price, quantity: qty, image: product.image || "" }] : [];

  const handleProceedToPay = async () => {
    if (!customerUser) {
      setError("Please login to place order.");
      return;
    }
    if (!fullName.trim()) { setError("Please enter full name."); return; }
    if (!phone.trim()) { setError("Please enter phone number."); return; }
    if (!address.trim()) { setError("Please enter address."); return; }
    if (!email) { setError("Please enter your email."); return; }
    setError("");
    setPlacing(true);
    try {
      const r = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerUser.email,
          name: fullName.trim(),
          items: orderItems,
          total,
          phone: phone.trim(),
          address: [building.trim(), colony.trim(), province.trim(), city.trim(), area.trim(), address.trim()].filter(Boolean).join(", ") || address.trim(),
          city: city.trim() || undefined,
          province: province.trim() || undefined,
          area: area.trim() || undefined,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d?.error || "Failed to place order");
      }
      if (fromCart) clearCart();
      router.push("/orders?placed=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-10 w-full min-w-0 max-w-full overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 min-w-0">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Delivery Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
              {!customerUser && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Building / Street</label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="Building, House No, Street"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Colony / Landmark</label>
                <input
                  type="text"
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                  placeholder="Colony, Locality, Landmark"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Province"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address (e.g. House#, Street#, Road)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:sticky lg:top-24 min-w-0">
            <h2 className="font-semibold text-slate-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
              {fromCart ? (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden">
                      <Image src={item.image} alt={getProductDisplayTitle(item, language)} fill className="object-contain p-1" sizes="80px" unoptimized={typeof item.id === "string"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 text-sm line-clamp-2">{getProductDisplayTitle(item, language)}</p>
                      <p className="text-[#f57224] font-bold text-sm mt-0.5">Rs. {(item.price * item.quantity).toLocaleString()} × {item.quantity}</p>
                    </div>
                  </div>
                ))
              ) : product ? (
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden">
                    <Image src={product.image} alt={getProductDisplayTitle(product, language)} fill className="object-contain p-1" sizes="80px" unoptimized={typeof product.id === "string"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 text-sm line-clamp-2">{getProductDisplayTitle(product, language)}</p>
                    <p className="text-[#f57224] font-bold text-sm mt-0.5">Rs. {price.toLocaleString()} × {qty}</p>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items Total ({totalQty} item{totalQty > 1 ? "s" : ""})</span>
                <span>Rs. {itemsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs. {DELIVERY_FEE.toLocaleString()}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between font-bold text-lg text-slate-800">
              <span>Total</span>
              <span className="text-[#f57224]">Rs. {total.toLocaleString()}</span>
            </div>
            {!customerUser && (
              <p className="mt-2 text-sm text-amber-700">Please login or sign up to place order.</p>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              type="button"
              disabled={placing || !customerUser}
              onClick={handleProceedToPay}
              className="mt-4 w-full btn-primary py-3 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placing ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Placing order…
                </>
              ) : "Proceed to Pay"}
            </button>
            <Link href="/" className="mt-3 block text-center text-slate-500 hover:text-[#f57224] text-sm">Continue shopping</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchProductById } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryDisplayName, getProductDisplayTitle } from "@/lib/displayName";
import { getCategoryTranslationKey } from "@/data/translations";
import Loader from "@/components/Loader";
import { getSectionDiscountPercent } from "@/data/sections";
import { useDelayedLoader } from "@/hooks/useDelayedLoader";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const id = params?.id as string;
  const [product, setProduct] = useState<{
    id: number | string;
    title: string;
    titleUr?: string;
    titleZh?: string;
    titleTranslations?: Record<string, string>;
    price: number;
    image: string;
    images?: string[];
    category?: string;
    description?: string;
    rating?: { rate: number; count: number };
    inStock?: boolean;
    originalPrice?: number | null;
    discountPercent?: number | null;
    sectionSlug?: string | null;
    reviews?: { id: string; author: string; text: string; rating: number; createdAt: string; isMine?: boolean }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const showLoader = useDelayedLoader(loading, 200);
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const [categoryNames, setCategoryNames] = useState<Record<string, { name: string; nameUr?: string; nameZh?: string; nameTranslations?: Record<string, string> }>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<"success" | "error" | null>(null);
  const [reviewErrorDelivery, setReviewErrorDelivery] = useState(false);
  const [reviewErrorAlreadyReviewed, setReviewErrorAlreadyReviewed] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const { addItem, removeItem, items } = useCart();
  const { customerUser, openSignupModal } = useAuth();
  const inCart = product ? items.some((i) => i.id === product.id) : false;

  const effectiveDiscountPercent = product
    ? (product.discountPercent != null
        ? product.discountPercent
        : getSectionDiscountPercent(product.sectionSlug))
    : 0;
  const effectiveOriginalPrice = product && effectiveDiscountPercent > 0
    ? (product.originalPrice != null && product.originalPrice > 0
        ? product.originalPrice
        : Math.round((product.price / (1 - effectiveDiscountPercent / 100)) * 100) / 100)
    : undefined;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    const isNumericId = /^\d+$/.test(String(id));
    const isDbProductId = typeof id === "string" && (id.startsWith("prod-") || !isNumericId);
    if (isDbProductId) {
      const emailParam = customerUser?.email ? `&email=${encodeURIComponent(customerUser.email.trim().toLowerCase())}` : "";
      fetch(`/api/store/products?id=${encodeURIComponent(id)}${emailParam}`)
        .then((r) => {
          if (r.status === 404) return null;
          return r.json();
        })
        .then((p: { id: string; title: string; titleUr?: string; titleZh?: string; titleTranslations?: Record<string, string>; price: number; image: string; images?: string[]; categorySlug: string; description?: string; rating?: { rate: number; count: number }; inStock?: boolean; originalPrice?: number | null; discountPercent?: number | null; reviews?: { id: string; author: string; text: string; rating: number; createdAt: string; isMine?: boolean }[] } | null) => {
          if (cancelled) return;
          if (p)
            setProduct({
              id: p.id,
              title: p.title,
              titleUr: p.titleUr,
              titleZh: p.titleZh,
              titleTranslations: p.titleTranslations,
              price: p.price,
              image: p.image || "/placeholder.png",
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : undefined,
              category: p.categorySlug,
              description: p.description,
              rating: p.rating,
              inStock: p.inStock !== false,
              originalPrice: p.originalPrice ?? undefined,
              discountPercent: p.discountPercent ?? undefined,
              sectionSlug: (p as { sectionSlug?: string | null }).sectionSlug ?? undefined,
              reviews: Array.isArray(p.reviews) ? p.reviews : [],
            });
          else setProduct(null);
        })
        .catch(() => { if (!cancelled) setProduct(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      fetchProductById(id)
        .then((data) => { if (!cancelled) setProduct(data); })
        .catch(() => { if (!cancelled) setProduct(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }
    return () => { cancelled = true; };
  }, [id, customerUser?.email]);

  const refetchProduct = () => {
    if (!id || typeof id !== "string") return;
    const emailParam = customerUser?.email ? `&email=${encodeURIComponent(customerUser.email.trim().toLowerCase())}` : "";
    fetch(`/api/store/products?id=${encodeURIComponent(id)}${emailParam}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p: { id: string; title: string; titleUr?: string; titleZh?: string; titleTranslations?: Record<string, string>; price: number; image: string; images?: string[]; categorySlug: string; description?: string; rating?: { rate: number; count: number }; inStock?: boolean; reviews?: { id: string; author: string; text: string; rating: number; createdAt: string; isMine?: boolean }[] } | null) => {
        if (p)
          setProduct({
            id: p.id,
            title: p.title,
            titleUr: p.titleUr,
            titleZh: p.titleZh,
            titleTranslations: p.titleTranslations,
            price: p.price,
            image: p.image || "/placeholder.png",
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : undefined,
            category: p.categorySlug,
            description: p.description,
            rating: p.rating,
            inStock: p.inStock !== false,
            reviews: Array.isArray(p.reviews) ? p.reviews : [],
          });
      })
      .catch(() => {});
  };

  const handleEditReview = () => {
    reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const handleDeleteReview = async (reviewId: string) => {
    if (!product || typeof product.id !== "string" || !customerUser?.email) return;
    if (!confirm(t("product.deleteReviewConfirm"))) return;
    setDeletingReviewId(reviewId);
    try {
      const res = await fetch(`/api/store/products/${encodeURIComponent(product.id)}/reviews`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customerUser.email.trim().toLowerCase(), reviewId }),
      });
      if (res.ok) refetchProduct();
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || typeof product.id !== "string") return;
    const email = customerUser?.email?.trim().toLowerCase() || "";
    if (!email) {
      setReviewMessage("error");
      setReviewErrorDelivery(true);
      return;
    }
    const isUpdate = hasExistingReview;
    const author = customerUser
      ? (customerUser.name?.trim() || customerUser.email?.replace(/^\+/, "").trim() || "Customer")
      : reviewAuthor.trim();
    if (!isUpdate && !author) {
      setReviewMessage("error");
      return;
    }
    if (reviewStars < 1 || reviewStars > 5) {
      setReviewMessage("error");
      return;
    }
    setReviewSubmitting(true);
    setReviewMessage(null);
    setReviewErrorDelivery(false);
    setReviewErrorAlreadyReviewed(false);
    try {
      const email = customerUser?.email?.trim().toLowerCase() || "";
      const url = `/api/store/products/${encodeURIComponent(product.id)}/reviews`;
      const res = await fetch(url, {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isUpdate
            ? { email, text: reviewText.trim() || "No comment", rating: reviewStars }
            : { author, text: reviewText.trim() || "No comment", rating: reviewStars, email }
        ),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setReviewAuthor(customerUser ? (customerUser.name?.trim() || customerUser.email?.replace(/^\+/, "").trim() || "Customer") : "");
        setReviewText("");
        setReviewStars(0);
        setReviewMessage("success");
        setReviewErrorDelivery(false);
        setReviewErrorAlreadyReviewed(false);
        refetchProduct();
        if (isUpdate && email) {
          fetch(`/api/store/products/${encodeURIComponent(product.id)}/reviews?email=${encodeURIComponent(email)}`)
            .then((r) => r.json())
            .then((d: { review?: { text: string; rating: number } | null }) => {
              if (d?.review) {
                setReviewText(d.review.text || "");
                setReviewStars(d.review.rating || 0);
              }
            })
            .catch(() => {});
        }
      } else {
        setReviewMessage("error");
        const alreadyReviewed = res.status === 403 && (data?.alreadyReviewed || (data?.error && String(data.error).includes("already reviewed")));
        setReviewErrorDelivery(res.status === 403 && !alreadyReviewed);
        setReviewErrorAlreadyReviewed(alreadyReviewed);
        if (alreadyReviewed && data?.review) {
          setHasExistingReview(true);
          setReviewText(data.review.text ?? "");
          setReviewStars(data.review.rating ?? 0);
        }
      }
    } catch {
      setReviewMessage("error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    fetch("/api/store/categories")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          const map: Record<string, { name: string; nameUr?: string; nameZh?: string; nameTranslations?: Record<string, string> }> = {};
          d.forEach((c: { slug: string; name: string; nameUr?: string | null; nameZh?: string | null; nameTranslations?: Record<string, string> | null }) => {
            map[c.slug] = { name: c.name, nameUr: c.nameUr ?? undefined, nameZh: c.nameZh ?? undefined, nameTranslations: c.nameTranslations ?? undefined };
          });
          setCategoryNames(map);
        }
      })
      .catch(() => {});
  }, []);

  // Logged-in user ka naam review ke liye auto use karo
  useEffect(() => {
    if (customerUser) {
      const name = customerUser.name?.trim() || customerUser.email?.replace(/^\+/, "").trim() || "Customer";
      setReviewAuthor(name);
    }
  }, [customerUser]);

  // Review form sirf tab dikhao jab user ko ye product deliver ho chuka ho
  useEffect(() => {
    if (!customerUser?.email || !product || typeof product.id !== "string") {
      setCanReview(null);
      setHasExistingReview(false);
      return;
    }
    const email = customerUser.email.trim().toLowerCase();
    fetch(`/api/store/can-review?productId=${encodeURIComponent(product.id)}&email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d: { canReview?: boolean }) => setCanReview(!!d.canReview))
      .catch(() => setCanReview(false));
  }, [customerUser?.email, product?.id]);

  // Jab canReview true ho, check karo ke user ne pehle review diya hai ya nahi – "Change your review" ke liye
  useEffect(() => {
    if (!customerUser?.email || !product || typeof product.id !== "string" || canReview !== true) {
      setHasExistingReview(false);
      return;
    }
    const email = customerUser.email.trim().toLowerCase();
    fetch(`/api/store/products/${encodeURIComponent(product.id)}/reviews?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d: { review?: { id: string; text: string; rating: number } | null }) => {
        if (d?.review) {
          setHasExistingReview(true);
          setReviewText(d.review.text || "");
          setReviewStars(d.review.rating || 0);
        } else {
          setHasExistingReview(false);
        }
      })
      .catch(() => setHasExistingReview(false));
  }, [customerUser?.email, product?.id, canReview]);

  const addToCart = () => {
    if (!product || product.inStock === false) return;
    if (!customerUser) {
      openSignupModal(`/product-details/${product.id}`);
      return;
    }
    addItem(
      { id: product.id, title: product.title, titleTranslations: product.titleTranslations, price: product.price, image: product.image, category: product.category },
      quantity
    );
  };
  const removeFromCart = () => {
    if (!product) return;
    removeItem(product.id);
  };

  const handleBuyNow = () => {
    if (!product || product.inStock === false) return;
    const returnUrl = `/checkout?buyNow=1&productId=${encodeURIComponent(String(product.id))}&qty=${quantity}`;
    // User site: only customer can go to checkout; guest or admin → show signup popup
    if (!customerUser) {
      openSignupModal(returnUrl);
      return;
    }
    router.push(returnUrl);
  };

  if (loading) {
    if (showLoader) return <Loader />;
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-9 h-9 border-2 border-slate-200 border-t-[#f57224] rounded-full animate-spin" />
      </div>
    );
  }
  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-10 sm:py-16 text-center">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 max-w-md mx-auto">
          <p className="text-slate-500 text-base sm:text-lg">{t("product.notFound")}</p>
          <Link href="/" className="inline-block mt-4 btn-primary text-sm sm:text-base">
            {t("product.backToHome")}
          </Link>
        </div>
      </div>
    );

  const displayTitle = getProductDisplayTitle(product, language);

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 md:py-12 w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-12 min-w-0">
        <div className="min-w-0">
          <div className="relative aspect-square max-h-[70vh] md:max-h-none bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-slate-200/80 shadow-sm">
            <Image
              src={(product.images && product.images[selectedImageIndex]) || product.image || "/placeholder.png"}
              alt={displayTitle}
              fill
              className="object-contain p-4 sm:p-6"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized={typeof product.id === "string"}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === i ? "border-[#f57224]" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="64px"
                    unoptimized={typeof product.id === "string"}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide">{product.category ? (() => {
            const custom = categoryNames[product.category!];
            if (custom) return getCategoryDisplayName(custom, language);
            return t(getCategoryTranslationKey(product.category!)) || product.category;
          })() : product.category}</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mt-1 leading-tight">
            {displayTitle}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {effectiveDiscountPercent > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">-{effectiveDiscountPercent}%</span>
            )}
            {(() => {
              const r = product.rating?.rate ?? 4;
              const count = product.rating?.count ?? 0;
              const stars = [1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= r ? "text-amber-400" : "text-slate-200"}>★</span>
              ));
              return (
                <>
                  <span className="flex text-base">{stars}</span>
                  <span className="text-slate-600 text-sm font-medium">{r.toFixed(1)}</span>
                  {count > 0 && <span className="text-slate-400 text-xs">({count} {t("product.reviews")})</span>}
                </>
              );
            })()}
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#f57224] mt-4 sm:mt-5">
            Rs. {(product.price * quantity).toLocaleString()}
            {effectiveOriginalPrice != null && effectiveOriginalPrice > 0 && (
              <span className="ml-2 text-lg sm:text-xl md:text-2xl text-slate-500 font-normal line-through">
                Rs. {(effectiveOriginalPrice * quantity).toLocaleString()}
              </span>
            )}
          </p>
          <p className={`text-sm font-bold mt-2 ${product.inStock === false ? "text-red-600" : "text-green-600"}`}>
            {product.inStock === false ? t("product.outOfStock") : t("product.inStock")}
          </p>
          {(product.description != null && product.description.trim() !== "") && (
            <div className="mt-4 sm:mt-5">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-2">Description</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {product.description.trim()}
              </p>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center border-2 border-slate-300 rounded-xl overflow-hidden self-start">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors duration-200 active:scale-95"
              >
                −
              </button>
              <span className="w-12 sm:w-14 text-center font-semibold text-base sm:text-lg">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors duration-200 active:scale-95"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={inCart ? removeFromCart : addToCart}
              disabled={product.inStock === false}
              className={`w-full sm:flex-1 sm:min-w-[140px] py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] ${
                product.inStock === false
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : inCart
                  ? "bg-white text-[#f57224] border-2 border-[#f57224] hover:bg-orange-50"
                  : "btn-primary"
              }`}
            >
              {product.inStock === false ? t("product.outOfStock") : inCart ? t("product.removeFromCart") : t("product.addToCart")}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.inStock === false}
              className={`w-full sm:flex-1 sm:min-w-[140px] py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98] ${
                product.inStock === false
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-slate-800 text-white hover:bg-slate-900"
              }`}
            >
              {t("product.buyNow")}
            </button>
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 space-y-2 text-xs sm:text-sm text-slate-600">
            <p className="flex items-center gap-2">• {t("product.freeDelivery499")}</p>
            <p className="flex items-center gap-2">• {t("product.returnPolicy")}</p>
            <p className="flex items-center gap-2">• {t("product.genuineGuarantee")}</p>
          </div>

          {(
            (product.reviews && product.reviews.length > 0) ||
            (product.rating && (product.rating.count ?? 0) > 0) ||
            (typeof product.id === "string")
          ) && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">{t("product.customerReviews")}</h2>
              <ul className="space-y-4">
                {(product.reviews && product.reviews.length > 0 ? product.reviews : []).map((rev) => (
                  <li key={rev.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-medium text-slate-800">{rev.author}</span>
                      <span className="flex text-amber-400 text-sm">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s}>{s <= (rev.rating || 0) ? "★" : "☆"}</span>
                        ))}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                      {(rev as { isMine?: boolean }).isMine && (
                        <span className="ml-auto flex gap-2">
                          <button
                            type="button"
                            onClick={handleEditReview}
                            className="text-xs font-medium text-[#f57224] hover:underline"
                          >
                            {t("product.editReview")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            disabled={deletingReviewId === rev.id}
                            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingReviewId === rev.id ? "..." : t("product.deleteReview")}
                          </button>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm">{rev.text}</p>
                  </li>
                ))}
              </ul>
              {typeof product.id === "string" && product.reviews?.length === 0 && (
                <p className="text-slate-500 text-sm py-2">No reviews yet.</p>
              )}

              {typeof product.id === "string" && customerUser && canReview === false && (
                <p className="text-slate-500 text-sm py-2 mt-2">{t("product.reviewAfterDelivery")}</p>
              )}

              {typeof product.id === "string" && canReview === true && (
                <div ref={reviewFormRef} className="mt-6 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-base font-semibold text-slate-800 mb-3">
                    {hasExistingReview ? t("product.changeReview") : t("product.writeReview")}
                  </h3>
                  {!hasExistingReview && (
                    <p className="text-slate-500 text-xs sm:text-sm mb-3">{t("product.reviewNote")}</p>
                  )}
                  <div className="space-y-3">
                    {customerUser ? (
                      <p className="text-sm text-slate-700">
                        {t("product.postingAs")}: <span className="font-medium text-slate-800">{customerUser.name?.trim() || customerUser.email?.replace(/^\+/, "") || "Customer"}</span>
                      </p>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t("product.yourName")}</label>
                        <input
                          type="text"
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f57224] focus:border-[#f57224] outline-none"
                          placeholder="e.g. Ali"
                          maxLength={200}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t("product.rateProduct")}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewStars(s)}
                            className="text-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
                            aria-label={`${s} star`}
                          >
                            <span className={s <= reviewStars ? "text-amber-400" : "text-slate-300"}>★</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t("product.yourReview")}</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f57224] focus:border-[#f57224] outline-none resize-none"
                        rows={3}
                        placeholder="Share your experience..."
                      />
                    </div>
                    {reviewMessage === "success" && (
                      <p className="text-sm text-green-600">{t("product.reviewSuccess")}</p>
                    )}
                    {reviewMessage === "error" && (
                      <p className="text-sm text-red-600">
                        {reviewErrorAlreadyReviewed
                          ? t("product.alreadyReviewed")
                          : reviewErrorDelivery
                            ? t("product.reviewAfterDelivery")
                            : customerUser
                              ? "Please select a rating (1–5)."
                              : "Please enter your name and select a rating (1–5)."}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={reviewSubmitting}
                      className="px-4 py-2 bg-[#f57224] text-white text-sm font-semibold rounded-lg hover:bg-[#e5651a] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {reviewSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {hasExistingReview ? t("product.updateReview") : t("product.submitReview")}
                        </>
                      ) : hasExistingReview ? t("product.updateReview") : t("product.submitReview")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

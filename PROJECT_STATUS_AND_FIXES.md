# Onmart Project – Proper Details | Kya Kaam Kar Raha Hai, Kya Nahi, Aur Fix Kaise Karein

---

## 1. Pehle Ye Check Karein (Quick Checklist)

| Cheez | Kaam karti hai? | Agar nahi to section |
|-------|-----------------|------------------------|
| Home page open hoti hai | ✓ / ✗ | 2 |
| Products dikhte hain | ✓ / ✗ | 2, 3 |
| Banner images dikhti hain | ✓ / ✗ | 4 |
| Logo navbar par dikhta hai | ✓ / ✗ | 4 |
| Category click par products aate hain | ✓ / ✗ | 3 |
| Search kaam karta hai | ✓ / ✗ | 2 |
| Add to Cart / Cart page | ✓ / ✗ | 5 |
| Login / Register | ✓ / ✗ | 6 |
| Product details page | ✓ / ✗ | 2, 3 |

---

## 2. Home Page – Products Nahi Aate / "No products found"

**Wajah:**  
Saari product data **FakeStore API** se aati hai: `https://fakestoreapi.com`.  
Agar API down ho, slow ho, ya internet / firewall block kare to products load nahi honge.

**Kya karein:**

1. Browser mein directly open karein: https://fakestoreapi.com/products  
   - Agar yahan data nahi dikha to API issue hai (kuch time baad try karein).
2. Console check karein: `F12` → Console. Agar **CORS** ya **network error** aaye to:
   - Same WiFi/network use karein, VPN off karke try karein.
3. Apna backend use karna ho to:
   - `.env.local` mein likhein: `NEXT_PUBLIC_API_URL=https://your-api.com`
   - `src/services/api.ts` wahi URL use karega.

**Search:**  
Search tab kaam karega jab products pehle load ho chuke hon. Agar products hi nahi aaye to search bhi "No products found" dikhayega.

---

## 3. Categories – Click Par Galat Ya Kam Products

**Wajah:**  
FakeStore API mein limited categories hain: `electronics`, `jewelery`, `men's clothing`, `women's clothing`.  
Isliye project mein **slug mapping** hai: jaise "Groceries" → API ko `men's clothing` bheja jata hai taake kuch products aaye.

**Mapping (api.ts):**

- Groceries & Pets → men's clothing  
- Health & Beauty → women's clothing  
- Mother & Baby → women's clothing  
- Home, Accessories, Appliances, Sports, Automotive → electronics  
- Men's / Women's Fashion, Electronics, Jewellery → same name  

Matlab: category name alag dikhta hai, lekin products inhi 4 API categories se aate hain. Ye **design ki wajah** hai, bug nahi.

---

## 4. Banner Images Aur Logo Nahi Dikhte

**Wajah:**  
Banners aur logo **local files** se aate hain. Agar files sahi jagah na hon ya naam galat ho to image break ho jati hai.

**Zaroori files:**

| Code mein path | File honi chahiye |
|----------------|-------------------|
| `/logo-onmart.png` | `public/logo-onmart.png` |
| `/banners/image 1.avif` | `public/banners/image 1.avif` |
| `/banners/image 2.avif` | `public/banners/image 2.avif` |
| `/banners/image 3.avif` | `public/banners/image 3.avif` |

**Kya karein:**

1. **Folder banao:** `daraz-clone/public/banners/`
2. **Files daalo:**  
   - Logo: `public/logo-onmart.png`  
   - Banners: `public/banners/` mein `image 1.avif`, `image 2.avif`, `image 3.avif`  
   - Naam bilkul same rakhein (space bhi: "image 1" not "image1")
3. Agar aapke paas `.avif` nahi to:
   - Ya to PNG/JPG use karein aur code mein path change karein (e.g. `image1.png`),  
   - Ya online converter se AVIF bana ke same naam se `public/banners/` mein rakhein.

Banners component mein **fallback** hai: image fail hone par orange box mein text dikhega. Logo ka fallback nahi hai, isliye logo file zaroor honi chahiye.

---

## 5. Cart – Add to Cart / Cart Page Kaam Nahi Karta

**Normal behaviour:**

- **Add to Cart** (product card ya product details): 1 item add hota hai.  
- **Product details** par quantity change karke "Add to Cart": utni quantity add hoti hai.  
- Cart **localStorage** mein save hota hai (`onmart-cart`).  
- Private/Incognito ya storage clear karne par cart khali ho jata hai.

**Agar cart dikhta hi nahi:**

- Browser console (F12) mein error to nahi?  
- `CartProvider` `layout.tsx` mein wrap hai – agar koi error layout mein ho to poora app break ho sakta hai. Console check karein.

**Checkout:**  
"Proceed to Checkout" abhi sirf **alert** dikhata hai. Real payment/order flow nahi hai – ye intentionally mock hai.

---

## 6. Login / Register – "Proper" Auth Nahi Hai

**Current behaviour (mock):**

- **Register:** Name, email, password (min 6), confirm password. Sab theek ho to `localStorage` mein `onmart-user` save hota hai aur home par redirect.
- **Login:** Email + password (4+ chars). Koi bhi aisa combination "success" – koi real check nahi. User `localStorage` mein save ho jata hai.

**Matlab:**  
Real verification, password hash, backend login **nahi** hai. Sirf UI flow hai.  
Proper auth ke liye backend API (login/register endpoints) lagana hoga aur `login/page.tsx` / `register/page.tsx` mein API call replace karni hogi.

---

## 7. Kaun Si Cheezein Bilkul Code Ke Hisaab Se Kaam Karti Hain

- Home page load (agar API reach ho)  
- Category menu + mega menu  
- URL se category: `/?category=electronics`  
- URL se search: `/?search=shirt`  
- Product grid, product card, Add to Cart / Remove from Cart  
- Cart page: quantity +/- , remove, total  
- Cart count navbar par  
- Product details page: image, price, description, quantity, Add to Cart  
- Login/Register form submit + redirect (mock)  
- Navbar search → home with search query  
- Footer links (abhi sab `#` – page nahi)  
- Responsive layout  
- Banners carousel (agar image files hon to; warna fallback text)

---

## 8. Jo Abhi "Proper" Nahi Hai (Intentional)

- Real login/register (backend + verification)  
- Real checkout / payment  
- Footer links – sab `#`, koi real page nahi  
- User profile / order history  
- Wishlist  
- Real product categories (FakeStore limited categories ki wajah se mapping use ho rahi hai)

---

## 9. Agar App Run Hi Nahi Ho

1. **Dependencies:**  
   `npm install`

2. **Run:**  
   `npm run dev`  
   Browser: http://localhost:3000

3. **Build error:**  
   `npm run build`  
   Jo error aaye woh batayein – file/line ke sath.

4. **Env:**  
   Abhi koi zaroori env variable nahi. Apna API lagana ho to:  
   `NEXT_PUBLIC_API_URL=https://your-api.com` in `.env.local`

---

## 10. Short Summary

- **Products / Home / Search / Categories** → Sab FakeStore API par depend hai. API reach + sahi network = ye sab kaam karega.  
- **Banners + Logo** → Sirf tab theek dikhenge jab `public/` aur `public/banners/` mein sahi naam ki files hon.  
- **Cart** → Logic theek hai, localStorage use hota hai; checkout sirf alert.  
- **Login/Register** → Sirf mock; proper auth ke liye backend chahiye.

Agar aapko koi specific screen par issue aa raha hai (e.g. "product details open hi nahi ho raha" ya "cart count update nahi hota"), to woh bata dein – us hisaab se exact fix likh sakte hain.

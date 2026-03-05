# Pehla kya karein? – Step by step (aram se)

Sirf ek ek step follow karo. Jitna ho gaya utna karo, phir agla step.

---

## Step 1 – MySQL open karo

1. Windows pe **Search** kholo (taskbar pe).
2. Likho: **MySQL 8.0 Command Line Client**
3. Us app pe **click** karo.
4. Black window open hogi. Wahan **apna MySQL password** type karo (jab MySQL install kiya tha tab jo password diya tha).  
   - Agar password nahi rakha tha, seedha **Enter** dabao.

*Yahan pe kuch type nahi dikhega — normal hai, password chup rehta hai. Type karke Enter dabao.*

---

## Step 2 – Database banao

Jo window Step 1 mein open hui thi, usi mein ye line type karo (copy-paste kar sakte ho):

```
CREATE DATABASE onmart;
```

**Enter** dabao. Agar koi error nahi aata, to database ban gaya.

Phir exit karne ke liye type karo: `exit` → **Enter**. MySQL window band ho jayegi.

---

## Step 3 – Project folder kholo aur Terminal kholo *(detail mein)*

**Step 3 ka matlab:** Cursor (ya VS Code) mein jahan aapka **onmart** project hai, wahi folder open hona chahiye, aur usi ke andar **Terminal** naam ki cheez kholni hai. Terminal woh jagah hai jahan aap **commands** type karke Enter marte ho — jaise `npx prisma generate`, `npm run dev` wagaira.

### 3.1 – Project folder open karo

1. **Cursor** ya **VS Code** open karo.
2. **File** menu pe jao → **Open Folder** (ya **Open…**).
3. **Desktop → New folder (9) → onmart** select karo (jahan `package.json`, `src` folder, `prisma` folder dikh rahe hon).
4. **Select Folder** / **Open** pe click karo.  
   Ab left side pe **Explorer** mein aapko **onmart** folder dikhega, uske andar files jaise `package.json`, `src`, `prisma` dikhengi.

*Samjho: Step 3 ka pehla hissa ye hai ke Cursor mein sahi project folder (onmart) open ho.*

### 3.2 – Terminal kholo

**Terminal** = Cursor ke niche ya side mein ek panel jahan **black/blue background** aur **text** dikhta hai; yahan aap type karke commands chalate ho.

**Terminal open karne ke 3 tareeke (koi bhi ek use karo):**

**Tareeka A – Shortcut (sabse aasaan)**  
- Keyboard pe **Ctrl + `** dabao.  
  (Backtick key ` keyboard pe **1** ke left, **Esc** ke niche hoti hai; kabhi **~** bhi usi pe hota hai.)  
- Ek naya panel niche ya side open hoga — wahi **Terminal** hai.

**Tareeka B – Menu se**  
- Upar **Terminal** menu pe click karo.  
- **New Terminal** pe click karo.  
- Neeche Terminal panel open ho jayega.

**Tareeka C – Command Palette se**  
- **Ctrl + Shift + P** dabao.  
- Type karo: **Terminal: Create New Terminal**  
- Enter dabao.

### 3.3 – Terminal sahi jagah pe hai confirm karo

Terminal mein jab cursor blink kare, to wahan type karo (sirf check ke liye):

```
cd
```

Enter dabao. Jo path dikhe (jaise `C:\...\onmart`), usme **onmart** aana chahiye. Agar `onmart` folder ka path dikh raha hai, to sahi jagah pe ho.

**Step 3 complete:** Ab aapke paas (1) onmart project open hai Cursor mein, aur (2) Terminal bhi open hai. Isi Terminal mein aage ke steps (4 ke baad) ki saari commands chalani hain.

---

## Step 4 – `.env` file banao

**Kyun:** App ko MySQL se connect karne ke liye **password aur database name** chahiye. Ye cheezein `.env` file mein likhi hoti hain taake code mein password dikhai na de.

**Kya karna hai:**

1. **Left side Explorer** mein **onmart** root folder pe jao (jahan `package.json` dikh raha hai).
2. **`.env`** naam ki file dekho.  
   - **Agar dikh rahi hai** → uspe double-click karke kholo.  
   - **Agar nahi hai** → root folder pe **right-click** → **New File** → naam do: **`.env`** (dot env, bina space).
3. `.env` file ke andar **sirf ye ek line** likho (apna MySQL password jagah pe):

```
DATABASE_URL="mysql://root:APNA_PASSWORD@localhost:3306/onmart"
```

- **APNA_PASSWORD** ki jagah jo MySQL ka password hai woh likho (jis se Step 1 mein login kiya tha).  
- Agar MySQL ka **password empty** hai to aise likho:  
  `DATABASE_URL="mysql://root:@localhost:3306/onmart"`

4. **Ctrl + S** dabao taake file save ho jaye.

---

## Step 5 – Prisma se MySQL mein tables banao

**Kyun:** App ko **User**, **Product**, **Order** wagaira ke liye MySQL mein **tables** chahiye. Ye do commands se Prisma automatically wo tables bana deta hai.

**Kya karna hai:** Step 3 wala **Terminal** use karo. Dono commands **ek ek karke** chalao.

**Pehli command:**

```
npx prisma generate
```

Type karo → **Enter** dabao. Kuch seconds rukho. Jab "Generated Prisma Client" jaisa message aaye, to doosri command chalao.

**Doosri command:**

```
npx prisma db push
```

Type karo → **Enter** dabao. Isse MySQL ke **onmart** database mein saari tables (User, Category, Product, Order, Banner, etc.) ban jayengi. End mein kuch "Your database is now in sync" jaisa dikh sakta hai.

---

## Step 6 – Admin user banao (seed)

**Kyun:** `/admin` pe login karne ke liye ek **admin account** chahiye. Ye command ek default admin user MySQL mein bana deti hai.

**Kya karna hai:** Usi **Terminal** mein ye command chalao:

```
npx prisma db seed
```

**Enter** dabao. Agar koi error nahi aata to admin user ban gaya hoga.

**Admin login details (yaad rakhna):**
- **Email:** admin@onmart.com  
- **Password:** admin123  

Baad mein **/admin** pe jaakar isi se login karna hai.

---

## Step 7 – App chalao

**Kya karna hai:** Usi **Terminal** mein ye command chalao:

```
npm run dev
```

**Enter** dabao. Thodi der baad terminal mein kuch aisa dikhega: **"Ready on http://localhost:3000"** ya **"Local: http://localhost:3000"**.

**Ab browser mein jao:**  
- Chrome/Edge kholo.  
- Address bar mein likho: **http://localhost:3000**  
- Enter dabao.

**Ab aap kar sakte ho:**
- **User:** Sign up / Login se account banao — sab MySQL mein save hoga.  
- **Admin:** Browser mein **http://localhost:3000/admin** likho → **admin@onmart.com** / **admin123** se login karo.

App band karne ke liye Terminal mein **Ctrl + C** dabao.

---

## Short summary – order yaad rakhne ke liye

| Step | Kya karna hai |
|------|----------------|
| 1 | MySQL 8.0 Command Line Client open karo, password do |
| 2 | `CREATE DATABASE onmart;` chalao, phir `exit` |
| 3 | Cursor mein onmart folder open karo, **Terminal** kholo (Ctrl + `) |
| 4 | `.env` file banao, `DATABASE_URL` likho (apna MySQL password ke sath) |
| 5 | `npx prisma generate` phir `npx prisma db push` |
| 6 | `npx prisma db seed` (admin user) |
| 7 | `npm run dev` → browser mein **http://localhost:3000** |

---

Agar kisi step pe **error** aaye to us step ka **poora error message** copy karke bata dena, theek karke bata denge. Ek step khatam karo, phir agla — aram se karo.

# Complete Setup Guide — Zero Errors, First Run

Ye guide bilkul step-by-step hai. Order follow karo, koi step skip mat karo — sab
kuch pehli baar me hi chalega.

---

## Part 1 — Project Kya Hai (Quick Recap)

- **94 files**, poora functional Next.js 15 app
- **29 pages/routes** — storefront, account, admin (10 sections), blog, API routes
- **Database**: PostgreSQL (Prisma se manage hota hai)
- **Zero fake code** — jo bhi dikh raha hai wo database se real data hai

---

## Part 2 — System Requirements (pehle ye check karo)

| Chahiye | Version | Check karne ka command |
|---|---|---|
| Node.js | 18.18 ya usse upar (20 LTS best) | `node -v` |
| npm | 9+ | `npm -v` |
| Git | koi bhi recent version | `git --version` |
| Code editor | VS Code recommended | — |

Agar Node purana hai: [nodejs.org](https://nodejs.org) se LTS version install karo.

---

## Part 3 — Har Ek Key Ki Complete List (kaunsi zaroori, kaunsi nahi)

### 🔴 REQUIRED — In ke bina app start hi nahi hoga

| # | Variable | Kya hai | Kahan se milega |
|---|---|---|---|
| 1 | `DATABASE_URL` | PostgreSQL connection string | Neon.tech ya Supabase.com (free) |
| 2 | `AUTH_SECRET` | Login sessions encrypt karne ke liye random string | Khud generate karo (Part 4 me batayenge) |

### 🟡 OPTIONAL — In ke bina bhi app chalega, bas wo specific feature off rahega

| # | Variable | Feature jo activate hoga | Agar skip karo to kya hoga |
|---|---|---|---|
| 3 | `RAZORPAY_KEY_ID` | Online payment | Sirf "Cash on Delivery" dikhega, kuch break nahi hoga |
| 4 | `RAZORPAY_KEY_SECRET` | ↑ same | ↑ same |
| 5 | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ↑ same (browser-side) | ↑ same |
| 6 | `GEMINI_API_KEY` | Divine Assistant chatbot + AI content tools | Chatbot bolega "not configured yet", admin ke AI buttons error dikhayenge (crash nahi honge) |
| 7 | `AI_MODEL` | Kaunsa Gemini model use ho | Default `gemini-3.5-flash` use hoga agar khali chhoda |
| 8 | `RESEND_API_KEY` | Order confirmation/shipped emails | Emails silently skip ho jaayenge, order phir bhi place hoga |
| 9 | `EMAIL_FROM` | Email ka "from" address | Default Resend sandbox address use hoga |
| 10 | `NEXT_PUBLIC_SITE_URL` | SEO metadata me full URL | Default `http://localhost:3000` use hoga |

### ⚪ NOT USED YET — safe to leave blank

`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
`SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD` — inko koi code call hi nahi karta
abhi, `.env.example` me sirf future ke liye placeholder hain. Chhod do khali.

---

## Part 4 — Ekdum Sahi Order Me Setup (copy-paste karo)

### Step 1: Project folder me jao aur dependencies install karo

```bash
cd divine-store
npm install
```

⏱ 2-3 minute lagega. Agar koi error aaye, Part 6 (Troubleshooting) dekho.

### Step 2: `.env` file banao

```bash
cp .env.example .env
```

Ab `.env` file ko kisi editor me kholo.

### Step 3: `DATABASE_URL` fill karo

1. [neon.tech](https://neon.tech) pe jao → free sign up
2. "Create Project" → koi bhi naam do → region select karo (India ke paas Singapore best hai)
3. Dashboard khulte hi ek **Connection String** dikhega, kuch aisa:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Ye poora string copy karo
5. `.env` me paste karo:
   ```
   DATABASE_URL="postgresql://neondb_owner:xxxxx@ep-xxxxx.../neondb?sslmode=require"
   ```
   ⚠️ **Quotes (`"`) zaroor rakhna, string ke around.**

*(Supabase use karna hai to: Project Settings → Database → Connection String → "URI" mode select karo, wahi paste karo.)*

### Step 4: `AUTH_SECRET` generate karo

Terminal me:
```bash
npx auth secret
```

Ye khud hi ek random string generate karke `.env` me daal dega (ya terminal me
print karega — agar print kare to manually `.env` me paste karo).

Manually karna ho to koi bhi 32+ character random string bhi chalega:
```
AUTH_SECRET="yeh-ek-bahut-lamba-random-string-hai-badal-do-ise-1234567890"
```

### Step 5: Database me tables banao

```bash
npx prisma db push
```

✅ Agar ye successfully chal gaya, terminal me "Your database is now in sync
with your Prisma schema" jaisa message dikhega.

### Step 6: Sample data daalo (products, admin login, coupons)

```bash
npm run db:seed
```

Isse 10 products, admin account, 2 coupons, 2 festival banners create ho
jaayenge.

### Step 7: App start karo

```bash
npm run dev
```

Browser me kholo: **http://localhost:3000**

---

## Part 5 — Pehli Baar Test Karne Ka Checklist

Isko order me follow karo — agar sab pass ho gaya, matlab setup 100% sahi hai:

- [ ] Homepage khul raha hai, products dikh rahe hain
- [ ] Kisi category pe click karo — products list ho rahe hain
- [ ] Product pe click karo — detail page khul raha hai
- [ ] "Add to Cart" click karo — cart me item add ho raha hai
- [ ] `/cart` pe jao — item dikh raha hai
- [ ] Checkout karo (guest ke roop me), address bharo, "Cash on Delivery" choose karo, order place karo
- [ ] Success page pe order number dikh raha hai + "Download Invoice" link kaam kar raha hai
- [ ] `/login` pe jao → `admin@divinestore.in` / `ChangeMe123!` se login karo
- [ ] `/admin` khul raha hai, dashboard me abhi place kiya order dikh raha hai
- [ ] `/admin/products` → koi product edit karke save karo — error nahi aana chahiye

**Agar sab ✅ ho gaya — aapka setup bilkul sahi hai, kisi optional key ke bina bhi.**

---

## Part 6 — Common Errors Aur Unke Fix (agar phir bhi kuch aaye)

| Error jo dikhega | Matlab kya hai | Fix |
|---|---|---|
| `Environment variable not found: DATABASE_URL` | `.env` file nahi bani, ya galat jagah hai | `.env` file `divine-store` folder ke root me honi chahiye (jahan `package.json` hai) |
| `Can't reach database server` | Connection string galat hai, ya Neon project pause ho gaya | String dobara copy karo; Neon free tier thodi der inactive rehne pe pause ho jaata hai — dashboard khol ke resume karo |
| `AUTH_SECRET is missing` | Step 4 skip ho gaya | `npx auth secret` chalao |
| `Module not found` / `Cannot find module` | `npm install` poora nahi hua | `rm -rf node_modules package-lock.json` phir `npm install` dobara |
| Port 3000 already in use | Koi aur app already us port pe chal rahi hai | `npm run dev -- -p 3001` se alag port pe chalao |
| Prisma Client errors after schema change | Naya field/model add hua but sync nahi hua | `npx prisma db push` phir se chalao |
| Login karne pe "Invalid email or password" | Seed nahi chala, ya password galat | `npm run db:seed` chalao; exact credentials: `admin@divinestore.in` / `ChangeMe123!` (case-sensitive) |
| AI chatbot "not configured" bol raha hai | `GEMINI_API_KEY` set nahi hai | Ye normal hai agar key nahi daali — Part 3 dekho, ye optional hai |
| Razorpay button nahi dikh raha checkout pe | Razorpay keys set nahi hain | Normal hai — COD abhi bhi kaam karta hai. Keys daalni ho to Part 3 dekho |
| `npm install` bahut slow ya fail | Internet/registry issue | `npm install --no-audit --no-fund` try karo, ya `npm cache clean --force` phir dobara |

---

## Part 7 — Ek Baar Sab Sahi Chalne Ke Baad: Optional Keys Add Karna

Ye koi bhi order me kar sakte ho, jab zaroorat pade:

1. **Razorpay** (online payment) → [razorpay.com](https://razorpay.com) → Settings → API Keys → Test mode se generate karo pehle
2. **Gemini** (AI assistant + content tools) → [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free)
3. **Resend** (emails) → [resend.com](https://resend.com) → API Keys

Har key `.env` me daalne ke baad, terminal me `Ctrl+C` karke `npm run dev`
dobara chalao (env changes ke liye restart zaroori hai).

---

## Part 8 — Production (Vercel) Pe Deploy Karte Waqt

1. Code GitHub pe push karo
2. [vercel.com](https://vercel.com) → "Import Project" → apna repo select karo
3. Deploy se pehle **Environment Variables** section me wahi saari keys daalo jo `.env` me hain
4. Deploy karo
5. Ek baar deploy ho jaaye, apni production `DATABASE_URL` (Neon/Supabase production database) ke against locally ye chalao:
   ```bash
   npx prisma db push
   npm run db:seed   # sirf agar sample data chahiye, warna skip karo
   ```

---

## Quick Reference — Sabse Zaroori 2 Commands Yaad Rakhna

Jab bhi naya code pull karo (`git pull`):

```bash
npm install          # agar package.json badla ho
npx prisma db push   # agar prisma/schema.prisma badla ho
```

Dono harmless hain agar kuch nahi badla — bina fear ke chala sakte ho.

# Divine Store — Storefront Core

A real, working Next.js 15 + TypeScript + Prisma + PostgreSQL storefront for a
single-owner spiritual products e-commerce business. Browsing, cart, checkout
(Razorpay + Cash on Delivery), order tracking, and authentication are fully
functional against a live database — nothing here is mocked or a placeholder.

## What's included so far

- **Database**: complete Prisma schema covering products, variants, categories,
  orders, coupons, addresses, wishlist, cart, reviews, blog, newsletter, media,
  and a `Conversation` / `KnowledgeChunk` model scaffolded for the AI assistant.
- **Auth**: Auth.js (NextAuth v5) with credentials login, JWT sessions,
  role-based middleware protecting `/account` and `/admin`.
- **Storefront**: home page, category listing with sort/pagination, product
  detail page (variants, FAQs, reviews, related products, JSON-LD SEO data),
  persistent cart (works for guests via a cookie session and merges into the
  account cart on login), coupon codes, and a full checkout flow.
- **Payments**: Razorpay order creation + signature verification wired end to
  end, with Cash on Delivery as a fully working fallback when no Razorpay keys
  are set — checkout never breaks, it just hides the online-payment option.
- **Admin panel** (`/admin`, protected — sign in as the seeded admin):
  dashboard with real revenue chart (Recharts), low-stock alerts, and recent
  orders pulled live from the database; full product CRUD (create/edit/
  publish/unpublish/delete) with an image-URL field; category management;
  coupon management (create, activate/deactivate, usage tracking); order
  management with inline status updates (Pending → Delivered/Cancelled/
  Refunded).
- **Divine Assistant** — a floating chat widget on every page (`GEMINI_API_KEY`
  required to activate it; it stays visible but tells the visitor honestly
  that it isn't configured yet if the key is missing, rather than faking
  answers). It's grounded with real retrieval, not free-form generation:
  - RAG over a `pgvector`-backed knowledge base of your products, categories,
    blog posts, and store policies (`/admin/ai` → "Re-index Knowledge Base").
  - If `pgvector` isn't set up yet, retrieval automatically falls back to a
    direct keyword search against the live product table — the assistant is
    never left making things up, just with a less semantic search until you
    run `prisma/pgvector.sql`.
  - Tool calling for **live** lookups the retrieved context can't answer from
    memory: `search_products`, `get_order_status` (requires order number +
    email, matched against real orders), `check_coupon`, `list_categories`.
  - Streamed responses, conversation history persisted per user/guest session,
    and an admin analytics view of recent customer questions.
- **Transactional email (Resend)** — order confirmation (sent immediately for
  COD, and after payment verification for Razorpay), shipped notification
  with a live courier tracking link, delivered confirmation, and a newsletter
  welcome email. Every send goes through one helper that logs and skips
  quietly if `RESEND_API_KEY` isn't set — no order, tracking update, or
  signup ever fails because email isn't configured.
- **Live courier tracking links** — admin enters a carrier + AWB number per
  order (`/admin/orders`), and customers get a direct link to track it on the
  courier's own site (Delhivery, Blue Dart, Ecom Express, DTDC, XpressBees,
  Shadowfax, India Post, Ekart) — on the order tracking page, account order
  history, checkout emails, and from the AI assistant.
- **Seed data**: 10 realistic products across 10 categories, an admin account,
  and two working coupons, so the site is browsable and manageable
  immediately after seeding.
- **Blog CMS** — `/blog` (public, SEO-friendly with JSON-LD) and `/admin/blog`
  (create/edit/publish/delete), including an AI "Generate Draft" button that
  writes a title, excerpt, and body from a topic you type.
- **Product image gallery** — admin can add/remove/reorder multiple images per
  product (not just one), with an AI "Generate alt text" button per image.
- **Product variants** — admin UI to add options like bead size or mala length,
  each with its own SKU, price difference, and stock count; the storefront's
  existing variant selector on the product page already reads from this.
- **PDF invoices** — real, generated-on-demand PDFs (via `pdfkit`, not a
  static template) for every order, downloadable from the checkout success
  page, account order history, guest order tracking, and the admin orders
  table. Access is gated: admins can download any invoice, customers only
  their own (logged-in ownership check, or matching checkout email for guests).
- **Admin AI content tools** — "Generate with AI" buttons for product
  descriptions, SEO meta title/description, image alt text, and full blog
  drafts, all built on the same `GEMINI_API_KEY` as the Divine Assistant.

## What's intentionally not built yet

Cloudinary direct image uploads (currently: paste an image URL — works for
both product images and blog featured images, just not drag-and-drop), full
Shiprocket API integration (shipping is a flat-rate rule plus manual
courier-link tracking rather than live automated status updates), password
reset UI, review moderation UI, and abandoned-cart recovery emails.

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET at minimum
npx prisma db push
npm run db:seed
npm run dev
```

Visit `http://localhost:3000`. Admin login seeded at `admin@divinestore.in` /
`ChangeMe123!` — change this password immediately in a real deployment.

### Enabling online payments

Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and
`NEXT_PUBLIC_RAZORPAY_KEY_ID` to `.env`. Until then, checkout automatically
offers Cash on Delivery only — there is no fake "pay" button.

### Enabling the AI knowledge base later

`prisma/pgvector.sql` adds the `pgvector` extension and an embedding column to
`KnowledgeChunk` once your Postgres provider supports it (Neon and Supabase
both do). Run it after `prisma db push`.

## Deploying

This is a standard Next.js app — push to GitHub and import into Vercel, add
the same environment variables there, then run `npx prisma db push` against
your production database (or set up `prisma migrate deploy` in your CI).

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Auth.js · Razorpay · Zod · React Hook Form · TanStack Query · Framer Motion
(ready to layer in on top of the current interactions) · Lucide icons.

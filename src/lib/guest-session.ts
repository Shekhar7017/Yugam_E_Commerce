import { cookies } from "next/headers";
import { nanoid } from "nanoid";

const COOKIE_NAME = "ds_guest_session";

/**
 * Read-only — safe to call during page rendering (e.g. from getCart() when a
 * page loads). Next.js does not allow setting cookies during a normal render,
 * only inside Server Actions or Route Handlers. Returns null if the visitor
 * has no guest session yet (i.e. their cart is empty — nothing to create).
 */
export async function getGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Read-or-create — actually sets the cookie if it doesn't exist yet. This
 * must ONLY be called from inside a Server Action (e.g. addToCart, triggered
 * by a button click) or a Route Handler — never during a page's render pass,
 * or Next.js throws "Cookies can only be modified in a Server Action or
 * Route Handler."
 */
export async function getOrCreateGuestSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = nanoid();
  cookieStore.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return id;
}

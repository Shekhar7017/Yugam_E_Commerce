/**
 * Prisma returns `Decimal` fields (price, total, etc.) as class instances,
 * not plain numbers. Next.js only allows plain serializable data to cross
 * from a Server Component into a "use client" component (or back from a
 * Server Action to client code) — passing a Decimal instance directly
 * throws "Only plain objects can be passed to Client Components".
 *
 * This does a JSON round-trip, which converts Decimal → string (via its
 * built-in toJSON) and Date → ISO string, making the result safe to pass
 * anywhere. Call this on any Prisma result right before it's returned from
 * a function whose output reaches a client component.
 */
export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

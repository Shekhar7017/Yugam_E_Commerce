import { getWishlist } from "@/actions/wishlist.actions";
import { ProductCard } from "@/components/product/product-card";

export default async function WishlistPage() {
  const items = await getWishlist();

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl mb-8">My Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">You haven't saved any items yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product as any} />
          ))}
        </div>
      )}
    </div>
  );
}

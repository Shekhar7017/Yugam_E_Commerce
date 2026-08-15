"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { formatINR } from "@/lib/utils";
import {
  placeOrder,
  createRazorpayOrder,
  confirmRazorpayPayment,
} from "@/actions/checkout.actions";
import { addressSchema } from "@/lib/validations";

type Address = {
  id: string;
  fullName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
};

const formSchema = z.object({
  addressId: z.string().optional(),
  useNewAddress: z.boolean().optional(),
  newAddress: addressSchema.partial().optional(),
  guestName: z.string().optional(),
  guestEmail: z.string().optional(),
  guestPhone: z.string().optional(),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
});

type FormValues = z.infer<typeof formSchema>;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutForm({
  summary,
  addresses,
  isLoggedIn,
  couponCode,
  razorpayKeyId,
}: {
  summary: { subtotal: number; discount: number; shippingFee: number; total: number };
  addresses: Address[];
  isLoggedIn: boolean;
  couponCode?: string;
  razorpayKeyId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addressId: addresses[0]?.id,
      useNewAddress: addresses.length === 0,
      paymentMethod: razorpayKeyId ? "RAZORPAY" : "COD",
    },
  });

  const useNewAddress = watch("useNewAddress") || addresses.length === 0;
  const paymentMethod = watch("paymentMethod");

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        addressId: useNewAddress ? undefined : values.addressId,
        newAddress: useNewAddress ? (values.newAddress as any) : undefined,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        guestPhone: values.guestPhone,
        paymentMethod: values.paymentMethod,
        couponCode,
      };

      const result = await placeOrder(payload);
      if (!result.success) {
        toast.error(result.error ?? "Could not place order");
        return;
      }

      if (values.paymentMethod === "COD") {
        router.push(`/checkout/success?order=${result.orderNumber}`);
        return;
      }

      // Razorpay flow
      if (!razorpayKeyId) {
        toast.error("Online payment isn't configured yet. Please choose Cash on Delivery.");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Could not load payment gateway. Check your connection and try again.");
        return;
      }

      const rzpOrder = await createRazorpayOrder(result.total!);

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.id,
        name: "Divine Store",
        description: `Order ${result.orderNumber}`,
        handler: async (response: any) => {
          const verify = await confirmRazorpayPayment(result.orderId!, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verify.success) {
            router.push(`/checkout/success?order=${result.orderNumber}`);
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: values.guestName, email: values.guestEmail, contact: values.guestPhone },
        theme: { color: "#C9822B" },
      });
      rzp.open();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        {!isLoggedIn && (
          <section className="border rounded-lg p-6">
            <h2 className="font-medium mb-4">Contact Details</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <input {...register("guestName")} placeholder="Full name" className="border rounded-md px-3 py-2 text-sm bg-background" />
              <input {...register("guestEmail")} placeholder="Email" className="border rounded-md px-3 py-2 text-sm bg-background" />
              <input {...register("guestPhone")} placeholder="Phone" className="border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
          </section>
        )}

        <section className="border rounded-lg p-6">
          <h2 className="font-medium mb-4">Shipping Address</h2>

          {addresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {addresses.map((addr) => (
                <label key={addr.id} className="flex items-start gap-3 border rounded-md p-3 cursor-pointer text-sm">
                  <input type="radio" value={addr.id} {...register("addressId")} defaultChecked={addr === addresses[0]} />
                  <span>
                    {addr.fullName}, {addr.line1}, {addr.city}, {addr.state} - {addr.postalCode} · {addr.phone}
                  </span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("useNewAddress")} />
                Ship to a new address
              </label>
            </div>
          )}

          {useNewAddress && (
            <div className="grid sm:grid-cols-2 gap-4">
              <input {...register("newAddress.fullName")} placeholder="Full name" className="border rounded-md px-3 py-2 text-sm bg-background" />
              <input {...register("newAddress.phone")} placeholder="Phone" className="border rounded-md px-3 py-2 text-sm bg-background" />
              <input {...register("newAddress.line1")} placeholder="Address line 1" className="border rounded-md px-3 py-2 text-sm bg-background sm:col-span-2" />
              <input {...register("newAddress.line2")} placeholder="Address line 2 (optional)" className="border rounded-md px-3 py-2 text-sm bg-background sm:col-span-2" />
              <input {...register("newAddress.city")} placeholder="City" className="border rounded-md px-3 py-2 text-sm bg-background" />
              <input {...register("newAddress.state")} placeholder="State" className="border rounded-md px-3 py-2 text-sm bg-background" />
              <input {...register("newAddress.postalCode")} placeholder="PIN Code" className="border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
          )}
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="font-medium mb-4">Payment Method</h2>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
              <input type="radio" value="RAZORPAY" {...register("paymentMethod")} />
              Pay Online (Razorpay — UPI, Cards, Netbanking)
            </label>
            <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
              <input type="radio" value="COD" {...register("paymentMethod")} />
              Cash on Delivery
            </label>
          </div>
          {paymentMethod === "RAZORPAY" && !razorpayKeyId && (
            <p className="text-xs text-destructive mt-2">
              Online payments aren't configured yet on this store — choose Cash on Delivery, or the
              owner can add Razorpay keys in the environment settings.
            </p>
          )}
        </section>
      </div>

      <div>
        <div className="border rounded-lg p-6 sticky top-24">
          <h2 className="font-display text-xl mb-4">Order Total</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatINR(summary.subtotal)}</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount</span>
                <span>-{formatINR(summary.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{summary.shippingFee === 0 ? "Free" : formatINR(summary.shippingFee)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatINR(summary.total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-6 bg-primary text-primary-foreground rounded-md py-3 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </form>
  );
}

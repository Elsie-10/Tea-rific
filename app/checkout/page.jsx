"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Smartphone, MapPin, User, CheckCircle, Loader, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart } = useCart();
  const { data: session }               = useSession();
  const router                          = useRouter();

  const [form, setForm] = useState({
    customerName: session?.user?.name  || "",
    phone:        session?.user?.phone || "",
    location:     "",
  });
  const [errors,    setErrors]    = useState({});
  const [step,      setStep]      = useState("form"); // form | success
  const [orderId,   setOrderId]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [serverErr, setServerErr] = useState("");

  // Empty cart guard
  if (cart.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-[#FDF8F0]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <ShoppingBag className="w-16 h-16 text-[#D4A843] mb-4" />
          <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Customise and add items from the menu first.</p>
          <Link href="/" className="btn-primary">Browse Menu</Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Full name is required.";
    if (!form.phone.trim())        e.phone        = "Phone number is required.";
    if (!form.location.trim())     e.location     = "Delivery location is required.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setServerErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          phone:        form.phone.trim(),
          location:     form.location.trim(),
          userId:       session?.user?.id || null,
          total:        totalAmount,
          items: cart.map((i) => ({
            productId:  i.id || i._id || null,
            name:       i.name,
            price:      i.price,
            quantity:   i.quantity,
            image:      i.image      || null,
            customNote: i.customNote || null,  // ← flavour, size, filling, occasion etc
          })),
        }),
      });

      // Guard against HTML error responses
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON from /api/orders:", text.slice(0, 300));
        throw new Error("Server error — please try again.");
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to place order.");

      setOrderId(data.data.id);
      clearCart();
      setStep("success");

    } catch (err) {
      console.error("Checkout error:", err);
      setServerErr(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#FDF8F0]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <CheckCircle className="w-20 h-20 text-[#4A7C59] mb-6" />
          <h1 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-3">Order Placed!</h1>
          <p className="text-gray-600 mb-1">
            Thank you, <strong>{form.customerName}</strong>!
          </p>
          <p className="text-gray-500 text-sm mb-2 max-w-md">
            Your order has been received. The baker will contact you to confirm
            details and arrange the 50% deposit payment.
          </p>
          <p className="text-[#6B3F1F] text-sm font-semibold mb-8">
            📞 You can also call us on{" "}
            <a href="tel:0720216244" className="underline">0720 216 244</a>
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            {orderId && (
              <Link href={`/order/${orderId}`} className="btn-secondary">
                Track My Order
              </Link>
            )}
            <Link href="/" className="btn-outline">Order More</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">Checkout</h1>
        <p className="text-gray-500 text-sm mb-8">
          Place your order and we will contact you to confirm and arrange payment.
        </p>

        {serverErr && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {serverErr}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* Form */}
          <div className="card p-6 space-y-5 h-fit">
            <div>
              <label className="block text-sm font-semibold text-[#2C2C2C] mb-1">
                <User className="inline w-4 h-4 mr-1" />Full Name
              </label>
              <input
                className="input-field"
                placeholder="Jane Muthoni"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
              {errors.customerName && (
                <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2C2C2C] mb-1">
                <Smartphone className="inline w-4 h-4 mr-1" />Phone Number
              </label>
              <input
                className="input-field"
                placeholder="0712 345 678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2C2C2C] mb-1">
                <MapPin className="inline w-4 h-4 mr-1" />Delivery Location
              </label>
              <input
                className="input-field"
                placeholder="e.g. Westlands, Nairobi"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" /> Placing order…</>
                : "Place Order"
              }
            </button>

            <p className="text-xs text-gray-400 text-center">
              Orders 24 hrs in advance · 50% deposit to confirm
            </p>
          </div>

          {/* Order summary */}
          <div className="card p-5 h-fit">
            <h2 className="font-serif text-lg font-bold text-[#2C2C2C] mb-4">Your Order</h2>
            <div className="space-y-4 mb-4">
              {cart.map((item) => (
                <div key={item._id || item.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 flex-1 pr-2 font-medium">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-bold text-[#6B3F1F] whitespace-nowrap">
                      Ksh {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  {/* Show the customer's choices to them for confirmation */}
                  {item.customNote && (
                    <p className="text-xs text-[#4A7C59] mt-0.5 leading-relaxed">
                      {item.customNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-[#F2E0D0] pt-3 flex justify-between font-bold text-[#2C2C2C]">
              <span>Total</span>
              <span className="text-[#6B3F1F]">Ksh {totalAmount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Filling charges & delivery confirmed separately by baker.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
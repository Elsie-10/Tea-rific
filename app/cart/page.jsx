"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, totalAmount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F0]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <ShoppingBag className="w-16 h-16 text-[#D4A843] mb-4" />
          <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Customise and add items from the menu.</p>
          <Link href="/" className="btn-primary">Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-8">Your Order</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="card p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#F2E0D0]">
                    <img
                      src={item.image || "/images/placeholder.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "/images/placeholder.jpg"; }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#2C2C2C] text-sm">{item.name}</h3>

                    {/* Custom note — shows flavour, size, filling etc */}
                    {item.customNote && (
                      <p className="text-xs text-[#4A7C59] mt-0.5 leading-relaxed">
                        {item.customNote}
                      </p>
                    )}

                    <p className="text-[#6B3F1F] font-bold mt-1 text-sm">
                      Ksh {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-72">
            <div className="card p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-[#2C2C2C] mb-4">Summary</h2>

              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 flex-1 pr-2 truncate">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-semibold text-[#2C2C2C] whitespace-nowrap">
                      Ksh {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#F2E0D0] pt-4 mb-1 flex justify-between font-bold text-[#2C2C2C]">
                <span>Total</span>
                <span className="text-[#6B3F1F]">Ksh {totalAmount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mb-5">
                Filling charges & delivery confirmed by owner separately.
              </p>

              <Link href="/checkout" className="btn-primary w-full block text-center">
                Place Order
              </Link>
              <Link href="/" className="block text-center text-sm text-[#4A7C59] mt-3 hover:underline">
                ← Add more items
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
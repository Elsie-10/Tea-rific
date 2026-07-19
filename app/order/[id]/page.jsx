"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Clock, ChefHat, Package, CheckCircle,
  XCircle, Phone, MapPin, RefreshCw, ArrowLeft,
} from "lucide-react";

const STATUS_STEPS = ["Pending", "Preparing", "Ready", "Completed"];

const STATUS_INFO = {
  Pending: {
    icon:  Clock,
    color: "text-yellow-600",
    bg:    "bg-yellow-100",
    label: "Order Received",
    desc:  "Your order has been received. The baker will confirm and contact you shortly.",
  },
  Preparing: {
    icon:  ChefHat,
    color: "text-blue-600",
    bg:    "bg-blue-100",
    label: "Being Prepared",
    desc:  "Your order is now in the kitchen being freshly baked for you.",
  },
  Ready: {
    icon:  Package,
    color: "text-green-600",
    bg:    "bg-green-100",
    label: "Ready",
    desc:  "Your order is ready! The baker will arrange delivery or pickup with you.",
  },
  Completed: {
    icon:  CheckCircle,
    color: "text-[#4A7C59]",
    bg:    "bg-green-50",
    label: "Completed",
    desc:  "Your order has been delivered. Thank you for choosing Tea-Terrific!",
  },
  Cancelled: {
    icon:  XCircle,
    color: "text-red-600",
    bg:    "bg-red-50",
    label: "Cancelled",
    desc:  "This order was cancelled. Please contact us if you have any questions.",
  },
};

const PAYMENT_COLORS = {
  Paid:    "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Failed:  "bg-red-100 text-red-700",
};

function StatusStep({ label, icon: Icon, isActive, isDone, isLast }) {
  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
          ${isDone || isActive ? "bg-[#6B3F1F] text-white shadow-md" : "bg-gray-100 text-gray-400"}
          ${isActive ? "ring-4 ring-[#6B3F1F]/20" : ""}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className={`text-xs font-semibold mt-2 text-center max-w-[70px] leading-tight
          ${isActive ? "text-[#6B3F1F]" : isDone ? "text-gray-600" : "text-gray-400"}`}>
          {label}
        </p>
      </div>
      {!isLast && (
        <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all
          ${isDone ? "bg-[#6B3F1F]" : "bg-gray-200"}`} />
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  const { id } = useParams();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [refresh, setRefresh] = useState(false);

  const fetchOrder = async () => {
    if (!id) { setError("No order ID provided."); setLoading(false); return; }
    setRefresh(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        setError(res.status === 404
          ? "Order not found. Please check your link or contact us on 0720 216 244."
          : "Something went wrong loading your order. Please try again.");
        return;
      }
      const data = await res.json();
      if (!data.success) { setError(data.error || "Could not load order."); return; }
      setOrder(data.data);
      setError("");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  // Auto-refresh every 30 seconds while order is active
  useEffect(() => {
    if (!order) return;
    if (["Completed", "Cancelled"].includes(order.order_status)) return;
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [order]);

  const isCancelled = order?.order_status === "Cancelled";
  const currentStep = STATUS_STEPS.indexOf(order?.order_status);
  const statusInfo  = STATUS_INFO[order?.order_status] || STATUS_INFO.Pending;
  const StatusIcon  = statusInfo.icon;

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Navigation bar ── */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/orders"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500
                       hover:text-[#6B3F1F] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            My Orders
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#6B3F1F] transition">
              Menu
            </Link>
            <Link href="/cart" className="text-gray-500 hover:text-[#6B3F1F] transition">
              Cart
            </Link>
            <button
              onClick={fetchOrder}
              disabled={refresh}
              className="flex items-center gap-1 text-gray-500 hover:text-[#6B3F1F]
                         transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refresh ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-6">Track Order</h1>

        {/* Loading */}
        {loading && (
          <div className="card p-12 text-center">
            <div className="w-10 h-10 border-4 border-[#6B3F1F] border-t-transparent
                            rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your order…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="card p-10 text-center">
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-[#2C2C2C] mb-2">
              Could not load order
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={fetchOrder}
                className="btn-primary flex items-center gap-2 justify-center">
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <a href="tel:0720216244" className="btn-outline text-center">
                📞 Call Us
              </a>
            </div>
            <Link href="/orders"
              className="block text-sm text-[#4A7C59] mt-4 hover:underline">
              ← Back to My Orders
            </Link>
          </div>
        )}

        {/* Order found */}
        {!loading && !error && order && (
          <div className="space-y-5">

            {/* Status banner */}
            <div className={`card p-6 ${statusInfo.bg} border-0`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full ${statusInfo.bg} ring-4 ring-white
                                 flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                </div>
                <div>
                  <p className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.label}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{statusInfo.desc}</p>
                  {!["Completed","Cancelled"].includes(order.order_status) && (
                    <p className="text-xs text-gray-400 mt-2">Auto-refreshes every 30 seconds</p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress stepper */}
            {!isCancelled && (
              <div className="card p-6">
                <h2 className="font-serif text-lg font-bold text-[#2C2C2C] mb-6">
                  Order Progress
                </h2>
                <div className="flex items-start">
                  {STATUS_STEPS.map((step, idx) => {
                    const info = STATUS_INFO[step];
                    return (
                      <StatusStep
                        key={step}
                        label={info.label}
                        icon={info.icon}
                        isDone={idx < currentStep}
                        isActive={idx === currentStep}
                        isLast={idx === STATUS_STEPS.length - 1}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="card p-6">
              <h2 className="font-serif text-lg font-bold text-[#2C2C2C] mb-4">
                Order Summary
              </h2>

              <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                <div className="bg-[#FDF8F0] rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Customer</p>
                  <p className="font-semibold text-[#2C2C2C]">{order.customer_name}</p>
                </div>
                <div className="bg-[#FDF8F0] rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Order Date</p>
                  <p className="font-semibold text-[#2C2C2C]">
                    {new Date(order.created_at).toLocaleDateString("en-KE", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-[#FDF8F0] rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <a href={`tel:${order.phone}`}
                    className="font-semibold text-[#6B3F1F] hover:underline">
                    {order.phone}
                  </a>
                </div>
                <div className="bg-[#FDF8F0] rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="font-semibold text-[#2C2C2C]">{order.location}</p>
                </div>
              </div>

              {/* Items */}
              {order.order_items?.length > 0 ? (
                <div className="space-y-3 mb-5">
                  {order.order_items.map((item) => (
                    <div key={item.id}
                      className="flex items-start gap-3 border border-[#F2E0D0] rounded-xl p-3">
                      {item.image && (
                        <img src={item.image} alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-[#F2E0D0]"
                          onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-sm text-[#2C2C2C]">
                            {item.quantity}× {item.name}
                          </p>
                          <p className="font-bold text-sm text-[#6B3F1F] ml-2 whitespace-nowrap">
                            Ksh {(Number(item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        {item.custom_note && (
                          <div className="mt-1.5 bg-[#FDF8F0] rounded-lg px-2.5 py-1.5">
                            {item.custom_note.split("·").map((part, i) => (
                              <p key={i} className="text-xs text-[#4A7C59]">• {part.trim()}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic mb-4">No item details available.</p>
              )}

              {/* Total */}
              <div className="border-t border-[#F2E0D0] pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Payment</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${PAYMENT_COLORS[order.payment_status] || ""}`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-[#6B3F1F]">
                    Ksh {Number(order.total).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom nav */}
            <div className="card p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link href="/orders"
                  className="flex items-center gap-1.5 text-sm font-semibold
                             text-[#6B3F1F] hover:underline">
                  <ArrowLeft className="w-4 h-4" /> All My Orders
                </Link>
                <div className="flex gap-3">
                  <Link href="/" className="btn-outline !py-2 !px-4 text-sm">
                    Browse Menu
                  </Link>
                  <a href="tel:0720216244"
                    className="btn-primary !py-2 !px-4 text-sm">
                    📞 Call Us
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
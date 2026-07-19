"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Clock, ChefHat, Package, CheckCircle,
  XCircle, ShoppingBag, ChevronRight,
} from "lucide-react";

const STATUS_ICON = {
  Pending:   { icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-100" },
  Preparing: { icon: ChefHat,      color: "text-blue-600",   bg: "bg-blue-100"   },
  Ready:     { icon: Package,      color: "text-green-600",  bg: "bg-green-100"  },
  Completed: { icon: CheckCircle,  color: "text-[#4A7C59]",  bg: "bg-green-50"   },
  Cancelled: { icon: XCircle,      color: "text-red-500",    bg: "bg-red-50"     },
};

const PAYMENT_COLORS = {
  Paid:    "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Failed:  "bg-red-100 text-red-700",
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60)    return "just now";
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchOrders = async () => {
      try {
        const res  = await fetch("/api/orders/my-orders");
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Could not load your orders.");
        } else {
          setOrders(data.data);
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status]);

  if (status === "loading" || (status === "unauthenticated")) {
    return (
      <div className="min-h-screen bg-[#FDF8F0]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-[#6B3F1F] border-t-transparent
                          rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#2C2C2C]">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            All orders placed by <span className="font-semibold text-[#6B3F1F]">
              {session?.user?.name}
            </span>
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="card p-10 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-[#2C2C2C] mb-1">Could not load orders</p>
            <p className="text-gray-500 text-sm mb-5">{error}</p>
            <button
              onClick={() => { setError(""); setLoading(true); }}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="card p-14 text-center">
            <ShoppingBag className="w-14 h-14 text-[#D4A843] mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              You have not placed any orders. Browse the menu and place your first order!
            </p>
            <Link href="/" className="btn-primary">Browse Menu</Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const info    = STATUS_ICON[order.order_status] || STATUS_ICON.Pending;
              const Icon    = info.icon;
              const isActive = !["Completed", "Cancelled"].includes(order.order_status);

              return (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="card p-5 flex items-start gap-4 hover:shadow-md
                             transition-all duration-200 cursor-pointer group"
                >
                  {/* Status icon */}
                  <div className={`w-11 h-11 rounded-full ${info.bg} flex items-center
                                   justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${info.color}`} />
                  </div>

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#2C2C2C] text-sm">
                          {order.order_items?.length > 0
                            ? order.order_items.slice(0, 2).map((i) => i.name).join(", ")
                            : "Order"
                          }
                          {order.order_items?.length > 2 &&
                            ` +${order.order_items.length - 2} more`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(order.created_at)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5
                                               group-hover:text-[#6B3F1F] transition" />
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Order status */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${info.bg} ${info.color}`}>
                        {order.order_status}
                      </span>

                      {/* Payment status */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${PAYMENT_COLORS[order.payment_status] || ""}`}>
                        {order.payment_status}
                      </span>

                      {/* Active pulse for in-progress orders */}
                      {isActive && (
                        <span className="flex items-center gap-1 text-xs text-[#4A7C59]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-pulse" />
                          In progress
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {order.location}
                      </p>
                      <p className="font-bold text-[#6B3F1F] text-sm">
                        Ksh {Number(order.total).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Place new order CTA */}
        {!loading && orders.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/" className="btn-primary inline-block">
              + Place Another Order
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
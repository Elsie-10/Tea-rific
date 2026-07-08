"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Clock, ChefHat, CheckCircle, TrendingUp,
  LogOut, RefreshCw, X, Phone, MapPin, User, Calendar, CreditCard,
} from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];

const STATUS_COLORS = {
  Pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  Preparing: "bg-blue-100 text-blue-800 border-blue-200",
  Ready:     "bg-green-100 text-green-800 border-green-200",
  Completed: "bg-gray-100 text-gray-700 border-gray-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const PAYMENT_COLORS = {
  Paid:    "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Failed:  "bg-red-100 text-red-700",
};

// ── Order Detail Modal ────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusUpdate }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#F2E0D0] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2C2C2C]">Order Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleDateString("en-KE", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Customer Info */}
          <div className="bg-[#FDF8F0] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6B3F1F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {order.customer_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#2C2C2C] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" /> {order.customer_name}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`tel:${order.phone}`} className="hover:text-[#6B3F1F] hover:underline">{order.phone}</a>
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {order.location}
                </p>
              </div>
            </div>
          </div>

          {/* Items Ordered */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</h3>
            <div className="space-y-2">
              {order.order_items?.length > 0 ? order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white border border-[#F2E0D0] rounded-xl p-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-[#F2E0D0]"
                      onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2C2C2C] truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Ksh {Number(item.price).toLocaleString()} each</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">×{item.quantity}</p>
                    <p className="text-sm font-bold text-[#6B3F1F]">
                      Ksh {(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400">No item details available.</p>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#F2E0D0]">
              <span className="font-semibold text-[#2C2C2C]">Total</span>
              <span className="text-xl font-bold text-[#6B3F1F]">Ksh {Number(order.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Payment:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PAYMENT_COLORS[order.payment_status] || ""}`}>
              {order.payment_status}
            </span>
            {order.mpesa_receipt_number && (
              <span className="text-xs text-gray-400 font-mono">#{order.mpesa_receipt_number}</span>
            )}
          </div>

          {/* Update Order Status */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Order Status</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusUpdate(order.id, s)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    order.order_status === s
                      ? STATUS_COLORS[s]
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#6B3F1F]"
                  }`}
                >
                  {order.order_status === s && "✓ "}{s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats]         = useState(null);
  const [orders, setOrders]       = useState([]);
  const [filter, setFilter]       = useState("All");
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (status === "authenticated" && session?.user?.role !== "owner") router.push("/");
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/owner/stats"),
        fetch(filter === "All" ? "/api/orders" : `/api/orders?status=${filter}`),
      ]);
      const [statsData, ordersData] = await Promise.all([statsRes.json(), ordersRes.json()]);
      if (statsData.success)  setStats(statsData.data);
      if (ordersData.success) setOrders(ordersData.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "owner") fetchData();
  }, [filter, session]);

  const updateOrderStatus = async (orderId, orderStatus) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
    });
    if (res.ok) {
      // Update locally so modal reflects change immediately
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, order_status: orderStatus } : o)
      );
      if (selected?.id === orderId) {
        setSelected((prev) => ({ ...prev, order_status: orderStatus }));
      }
      fetchData();
    }
  };

  if (status === "loading" || !session || session.user.role !== "owner") return null;

  const statCards = [
    { label: "Total Orders",   value: stats?.totalOrders      ?? "—", icon: ShoppingBag, color: "bg-[#6B3F1F]" },
    { label: "Pending",        value: stats?.pendingOrders    ?? "—", icon: Clock,       color: "bg-yellow-500" },
    { label: "Preparing",      value: stats?.preparingOrders  ?? "—", icon: ChefHat,     color: "bg-blue-500"   },
    { label: "Completed",      value: stats?.completedOrders  ?? "—", icon: CheckCircle, color: "bg-[#4A7C59]"  },
    { label: "Revenue (Ksh)",  value: stats?.totalRevenue != null ? Number(stats.totalRevenue).toLocaleString() : "—", icon: TrendingUp, color: "bg-[#D4A843]" },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0]">

      {/* Header */}
      <header className="bg-[#6B3F1F] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold">Tea-Terrific</h1>
          <p className="text-[#F2E0D0] text-xs">Owner Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#F2E0D0] hidden sm:block">{session.user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-sm text-[#F2E0D0] hover:text-white transition"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#2C2C2C]">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Orders header + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">Orders</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {["All", "Pending", "Preparing", "Ready", "Completed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  filter === s ? "bg-[#6B3F1F] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#6B3F1F]"
                }`}
              >
                {s}
              </button>
            ))}
            <button onClick={fetchData} className="p-2 rounded-full hover:bg-white transition" aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Orders table */}
        {loading ? (
          <div className="card p-8 text-center text-gray-400">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="card p-16 text-center text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-lg font-semibold">No orders yet</p>
            <p className="text-sm mt-1">New orders will appear here.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F2E0D0] bg-[#FDF8F0]">
                  {["Customer","Phone","Location","Items","Total","Payment","Status","Date",""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#F2E0D0] hover:bg-[#FDF8F0] transition cursor-pointer"
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-4 py-3 font-semibold text-[#2C2C2C] whitespace-nowrap">{order.customer_name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <a href={`tel:${order.phone}`} className="hover:text-[#6B3F1F] hover:underline" onClick={(e) => e.stopPropagation()}>
                        {order.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{order.location}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.order_items?.slice(0, 2).map((i) => (
                        <span key={i.id} className="block text-xs whitespace-nowrap">{i.quantity}× {i.name}</span>
                      ))}
                      {order.order_items?.length > 2 && (
                        <span className="text-xs text-gray-400">+{order.order_items.length - 2} more</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#6B3F1F] whitespace-nowrap text-right">
                      Ksh {Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PAYMENT_COLORS[order.payment_status] || ""}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.order_status] || ""}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(order); }}
                        className="text-xs text-[#6B3F1F] font-semibold hover:underline whitespace-nowrap"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Order detail modal */}
      {selected && (
        <OrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={updateOrderStatus}
        />
      )}
    </div>
  );
}
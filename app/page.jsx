"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

const CATEGORIES = ["All", "Cake", "Loaf", "Cupcake", "Cookie", "Special"];

// Static catalogue — always shown regardless of DB state
// Matches the exact real menu from the owner
const CATALOGUE = [
  // ── Cakes ──────────────────────────────────────────────────
  {
    id: "cake-main", name: "Cake", category: "Cake", featured: true, price: 4000,
    description: "Swiss Meringue Buttercream on every cake. Choose vanilla, chocolate, or carrot cinnamon. 1 Kg / 1.5 Kg / 2 Kg.",
  },
  // ── Loaves ─────────────────────────────────────────────────
  {
    id: "loaf-main", name: "Loaf", category: "Loaf", featured: true, price: 1500,
    description: "Freshly baked loaves. Five flavour options. Single or double.",
  },
  // ── Cupcakes ───────────────────────────────────────────────
  {
    id: "cupcake-main", name: "Cupcakes – Dozen", category: "Cupcake", featured: true, price: 1800,
    description: "Butter cream frosted cupcakes, sold by the dozen (12 pcs).",
  },
  // ── Cookies ────────────────────────────────────────────────
  {
    id: "cookie-main", name: "Cookies – Full Batch", category: "Cookie", featured: false, price: 1800,
    description: "Chocolate chip or ginger. Crispy outside, chewy inside. Full batch.",
  },
  // ── Specials ───────────────────────────────────────────────
  {
    id: "celebration-main", name: "Large Celebration Cake", category: "Special", featured: true, price: 9000,
    description: "4 Kg cake. Serves 70+ people. Corporate and family events. Tell us exactly what you need.",
  },
  {
    id: "fruit-cake", name: "Fruit Cake", category: "Special", featured: true, price: 5000,
    description: "Rich, moist fruit cake packed with premium dried fruits. Great for celebrations and gifting.",
  },
];

export default function HomePage() {
  const [activeTab,       setActiveTab]       = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dbProducts,      setDbProducts]      = useState([]);

  // Try to load products from DB — if it works, use them; otherwise use CATALOGUE
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => { if (d?.success && d.data?.length) setDbProducts(d.data); })
      .catch(() => {});
  }, []);

  const products = dbProducts.length > 0 ? dbProducts : CATALOGUE;

  const visible = activeTab === "All"
    ? products
    : products.filter((p) => p.category === activeTab);

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#6B3F1F] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="text-center lg:text-left">
            <p className="text-[#D4A843] text-sm font-semibold uppercase tracking-widest mb-3">
              Freshly Baked Daily
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Tea-rific Treats
            </h1>
            <p className="text-[#F2E0D0] text-lg max-w-xl mx-auto lg:mx-0 mb-4">
              Artisan cakes, loaves, cupcakes & cookies — every item made fresh to your
              exact order.
            </p>
            <div className="space-y-1 text-sm text-[#F2E0D0]">
              <p>📞 0720 216 244</p>
              <p>⏰ Orders must be placed <strong className="text-[#D4A843]">24 hours in advance</strong></p>
              <p>💳 <strong className="text-[#D4A843]">50% deposit</strong> required to confirm order</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
              <a href="#menu"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#6B3F1F] hover:bg-[#F2E0D0] transition">
                View Menu
              </a>
              <a href="tel:0720216244"
                className="rounded-full border border-[#D4A843] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#7E4A23] transition">
                📞 Call Us
              </a>
            </div>
          </div>

          {/* Menu image */}
          <div id="menu" className="overflow-hidden rounded-[2rem] border border-[#D4A843]/40 shadow-xl">
            <Image
              src="/images/Backery0.jpeg"
              alt="Tea-rific Treats menu"
              width={800}
              height={600}
              priority
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <div className="bg-white border-b border-[#F2E0D0] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === cat
                  ? "bg-[#6B3F1F] text-white"
                  : "bg-[#FDF8F0] text-gray-600 hover:bg-[#F2E0D0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#FDF8F0] border-b border-[#F2E0D0]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-6 justify-center text-sm text-gray-500">
          <span>🎨 <strong className="text-[#2C2C2C]">Customise</strong> — pick your flavour, size & filling</span>
          <span>🛒 <strong className="text-[#2C2C2C]">Add to cart</strong> — review your full order</span>
          <span>📝 <strong className="text-[#2C2C2C]">Place order</strong> — we confirm & arrange payment</span>
        </div>
      </div>

      {/* Products grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {visible.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🧁</p>
            <p className="text-lg font-semibold">No items in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                onConfigure={setSelectedProduct}
              />
            ))}
          </div>
        )}

        {/* Terms */}
        <div className="mt-16 bg-white border border-[#D4A843] rounded-2xl p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-[#6B3F1F] mb-2">
            Terms & Conditions
          </h3>
          <p className="text-gray-600 text-sm">
            All orders must be placed <strong>24 hours in advance</strong> with a{" "}
            <strong>50% deposit</strong>. Extra charges apply for fillings, additional
            items, and delivery. The owner will contact you to confirm details and
            arrange payment.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#F2E0D0] py-8 text-center text-sm text-gray-400 bg-white">
        <p className="font-serif text-[#6B3F1F] font-bold text-lg mb-1">Tea-rific Treats Bakery</p>
        <p>📞 <a href="tel:0720216244" className="hover:underline">0720 216 244</a></p>
        <p className="mt-2">© {new Date().getFullYear()} Tea-rific Treats Bakery. Made with ♥ in Nairobi.</p>
      </footer>

      {/* Product configurator modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
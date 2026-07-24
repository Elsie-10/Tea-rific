"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, ShoppingCart } from "lucide-react";

// ── Category emoji — keys match product.category (plural) ─────
const CATEGORY_EMOJI = {
  Cakes:    "🎂",
  Loaves:   "🍞",
  Yoghuts:  "🥛",
  Cupcakes: "🧁",
  Cookies:  "🍪",
  Specials: "✨",
};

// ── Blurb shown on card — keys match product.category ─────────
const CARD_BLURB = {
  Cakes:    "Choose flavour, size & optional filling. SMBC frosting on every cake.",
  Loaves:   "Choose from 5 flavours in single or double size.",
  Yoghuts:  "Fresh and creamy. Sweetened or unsweetened. Ksh 500 per litre.",
  Cupcakes: "Butter cream frosted cupcakes — order by the dozen.",
  Cookies:  "Chocolate chip or ginger — full batch, baked fresh.",
  Specials: "4 Kg · Serves 70+ · Tell us exactly what you need.",
};

// ── Fallback image per category ───────────────────────────────
const CATEGORY_FALLBACK = {
  Cakes:    "/images/cake.jpeg",
  Loaves:   "/images/loaf1a.jpeg",
  Yoghuts:  "/images/yoghut.jpeg",
  Cupcakes: "/images/cupcake1a.jpeg",
  Cookies:  "/images/cookies.jpeg",
  Specials: "/images/celebrationcake3c.jpeg",
};

export default function ProductCard({ product, onConfigure }) {
  const { addItem }         = useCart();
  const { data: session }   = useSession();
  const router              = useRouter();
  const [imgErr, setImgErr] = useState(false);
  const [added,  setAdded]  = useState(false);

  // Use product.image first, fallback to category image
  const imageSrc = imgErr || !product.image
    ? (CATEGORY_FALLBACK[product.category] || "/images/placeholder.jpg")
    : product.image;

  // Yoghuts are simple add-to-cart, everything else opens configurator
  const isYoghut      = product.category === "Yoghuts";
  const isConfigurable = !isYoghut && !!onConfigure;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!session) { router.push("/auth/login"); return; }
    addItem({
      ...product,
      _id:        product._id || product.id,
      customNote: product.options?.[0] ? `Type: ${product.name}` : null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleClick = () => {
    if (isConfigurable) onConfigure(product);
  };

  return (
    <div
      className={`card group hover:shadow-lg transition-all duration-200 flex flex-col
                  ${isConfigurable ? "cursor-pointer" : ""}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative w-full h-52 bg-[#F2E0D0] overflow-hidden flex-shrink-0">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgErr(true)}
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-[#D4A843] text-white text-[10px]
                           font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            Popular
          </span>
        )}
        <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-base
                         px-2 py-0.5 rounded-full shadow-sm">
          {CATEGORY_EMOJI[product.category] || "🛒"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#4A7C59] font-semibold uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-serif text-[#2C2C2C] font-semibold text-base leading-snug mb-1">
          {product.name}
        </h3>
        <p className="text-gray-400 text-xs mb-3 flex-1 leading-relaxed">
          {CARD_BLURB[product.category] || product.description}
        </p>

        {/* Options chips — for yoghut and cookies */}
        {isYoghut && product.options?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.options.map((opt) => (
              <span key={opt}
                className="text-[10px] bg-[#FDF8F0] border border-[#F2E0D0]
                           text-[#6B3F1F] px-2 py-0.5 rounded-full font-medium">
                {opt}
              </span>
            ))}
          </div>
        )}

        {/* Price + button */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F2E0D0]">
          <span className="text-[#6B3F1F] font-bold text-sm">
            Ksh {Number(product.price).toLocaleString()}
          </span>

          {isYoghut ? (
            // Yoghut — simple add to cart
            <button
              type="button"
              onClick={handleAdd}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold
                          active:scale-95 transition-all duration-150
                          ${added
                            ? "bg-[#4A7C59] text-white"
                            : "bg-[#6B3F1F] text-white hover:bg-[#8B5A2B]"
                          }`}
            >
              <Plus className="w-4 h-4" />
              {added ? "Added!" : "Add"}
            </button>
          ) : (
            // Everything else — opens configurator
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (onConfigure) onConfigure(product); }}
              className="flex items-center gap-1.5 bg-[#6B3F1F] text-white px-4 py-2
                         rounded-lg text-sm font-semibold hover:bg-[#8B5A2B]
                         active:scale-95 transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

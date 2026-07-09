"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORY_EMOJI = {
  Cake: "🎂", Loaf: "🍞", Cupcake: "🧁",
  Cookie: "🍪", Special: "✨", Drink: "☕", Other: "🛒",
};

// ── Deterministic image picker — keyed by product name ────────────────────
// This runs BEFORE any network request so images are always correct.
// Priority: name match → category pool → placeholder
const NAME_TO_IMAGE = {
  // Cakes
  "cake – 1 kg":            "/images/cake.jpeg",
  "cake – 1½ kg":           "/images/cake2.jpeg",
  "cake – 2 kg":            "/images/cake4.jpeg",
  "classic cake":           "/images/cake.jpeg",
  "butter cake":            "/images/cake2.jpeg",
  "cream cake":             "/images/cake4.jpeg",
  "layered cake":           "/images/cake4a.jpeg",
  "mini cakes":             "/images/cakes1a.jpeg",
  "berry cake":             "/images/cakes2.jpeg",
  // Loaves
  "single loaf":            "/images/loaf1a.jpeg",
  "golden loaf":            "/images/loaf1b.jpeg",
  "tea loaf":               "/images/loaf1c.jpeg",
  "double loaf":            "/images/loafa.jpeg",
  // Cupcakes
  "cupcakes – dozen (12 pcs)": "/images/cupcake1a.jpeg",
  "cupcakes – dozen":       "/images/cupcake1a.jpeg",
  "cupcake delight":        "/images/cupcake1b.jpeg",
  "cupcake bloom":          "/images/cupcake1c.jpeg",
  "cupcake classic":        "/images/cupcake1d.jpeg",
  // Cookies
  "cookies – full batch":   "/images/cookies.jpeg",
  // Specials — fruit cakes
  "fruit cake":             "/images/fruitcake.jpeg",
  "fruit cake special":     "/images/fruitcake1.jpeg",
  // Specials — celebration cakes
  "large celebration cake": "/images/celebrationcake1.jpeg",
  "celebration cake":       "/images/celebrationcake1.jpeg",
  "celebration deluxe":     "/images/celebrationcake1a.jpeg",
  "celebration two-tier":   "/images/celebrationcake2.jpeg",
  "celebration bloom":      "/images/celebrationcake2a.jpeg",
  "celebration classic":    "/images/Celebrationcake3a.jpeg",
  "celebration premium":    "/images/celebrationcake3b.jpeg",
  "celebration joy":        "/images/celebrationcake3c.jpeg",
};

// Pool of images per category — used when name doesn't match
const CATEGORY_POOL = {
  Cake:    ["/images/cake.jpeg", "/images/cake2.jpeg", "/images/cake4.jpeg", "/images/cake4a.jpeg", "/images/cakes1a.jpeg", "/images/cakes2.jpeg"],
  Loaf:    ["/images/loaf1a.jpeg", "/images/loaf1b.jpeg", "/images/loaf1c.jpeg", "/images/loafa.jpeg"],
  Cupcake: ["/images/cupcake1a.jpeg", "/images/cupcake1b.jpeg", "/images/cupcake1c.jpeg", "/images/cupcake1d.jpeg"],
  Cookie:  ["/images/cookies.jpeg"],
  Special: ["/images/celebrationcake1.jpeg", "/images/celebrationcake1a.jpeg", "/images/celebrationcake2.jpeg", "/images/fruitcake.jpeg", "/images/fruitcake1.jpeg"],
};

function pickImage(product) {
  // 1. Check name map (lowercase, trimmed)
  const key = (product.name || "").toLowerCase().trim();
  if (NAME_TO_IMAGE[key]) return NAME_TO_IMAGE[key];

  // 2. If name contains "fruit", always use fruitcake
  if (key.includes("fruit")) return "/images/fruitcake.jpeg";

  // 3. If name contains "celebration" or "large", use celebration pool
  if (key.includes("celebration") || key.includes("large")) return "/images/celebrationcake1.jpeg";

  // 4. Category pool — pick deterministically by name hash so same product always gets same image
  const pool = CATEGORY_POOL[product.category];
  if (pool?.length) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
    return pool[hash % pool.length];
  }

  return "/images/placeholder.jpg";
}

export default function ProductCard({ product }) {
  const { addItem }       = useCart();
  const { data: session } = useSession();
  const router            = useRouter();
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  // Always derive image from name/category — ignore whatever the DB says
  const imageSrc = imgErr ? "/images/placeholder.jpg" : pickImage(product);

  const handleAdd = () => {
    if (!session) { router.push("/auth/login"); return; }
    addItem({ ...product, _id: product._id || product.id });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card group hover:shadow-md transition-all duration-200 flex flex-col">

      {/* Image */}
      <div className="relative w-full h-52 bg-[#F2E0D0] overflow-hidden flex-shrink-0">
        {/* Use plain <img> — no Next.js Image size constraints that could cause caching issues */}
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgErr(true)}
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-[#D4A843] text-white text-[10px] font-bold
                           uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
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
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">
          {product.description}
        </p>

        {product.options?.length > 0 && (
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

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F2E0D0]">
          <span className="text-[#6B3F1F] font-bold text-lg">
            Ksh {Number(product.price).toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold
                        active:scale-95 transition-all duration-150
                        ${added
                          ? "bg-[#4A7C59] text-white"
                          : "bg-[#6B3F1F] text-white hover:bg-[#8B5A2B]"}`}
          >
            <Plus className="w-4 h-4" />
            {added ? "Added!" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Settings2, Plus } from "lucide-react";

const CATEGORY_EMOJI = {
  Cake: "🎂", Loaf: "🍞", Cupcake: "🧁",
  Cookie: "🍪", Special: "✨",
};

// Categories that need a configurator modal
const CONFIGURABLE = ["Cake", "Loaf", "Special", "Cookie", "Cupcake"];

const NAME_TO_IMAGE = {
  // Cakes
  "cake – 1 kg":               "/images/cake.jpeg",
  "cake – 1½ kg":              "/images/cake2.jpeg",
  "cake – 2 kg":               "/images/cake4.jpeg",
  // Loaves
  "single loaf":               "/images/loaf1a.jpeg",
  "double loaf":               "/images/loafa.jpeg",
  // Cupcakes
  "cupcakes – dozen (12 pcs)": "/images/cupcake1a.jpeg",
  // Cookies
  "cookies - chocolate chip":      "/images/cookies.jpeg",
  "cookies - ginger":      "/images/cookies.jpeg",
  // Specials
  "fruit cake":                "/images/fruitcake.jpeg",
  "large celebration cake":    "/images/celebrationcake1.jpeg",
};

const CATEGORY_FALLBACK = {
  Cake:    "/images/cake.jpeg",
  Loaf:    "/images/loaf1a.jpeg",
  Cupcake: "/images/cupcake1a.jpeg",
  Cookie:  "/images/cookies.jpeg",
  Special: "/images/celebrationcake1.jpeg",
};

function pickImage(product) {
  const key = (product.name || "").toLowerCase().trim();
  if (NAME_TO_IMAGE[key]) return NAME_TO_IMAGE[key];
  if (key.includes("fruit"))        return "/images/fruitcake.jpeg";
  if (key.includes("celebration"))  return "/images/celebrationcake1.jpeg";
  return CATEGORY_FALLBACK[product.category] || "/images/placeholder.jpg";
}

// Short description shown on card per category
const CARD_BLURB = {
  Cake:    "Choose flavour, size & optional fruit filling. SMBC frosting on every cake.",
  Loaf:    "Choose from 5 flavours in single or double size.",
  Cupcake: "Butter cream frosted cupcakes — order by the dozen.",
  Cookie:  "Chocolate chip or ginger — full batch, baked fresh.",
  Special: "4 Kg · Serves 70+ · Tell us exactly what you need.",
};

const CARD_PRICE = {
  Cake:    "From Ksh 4,000",
  Loaf:    "From Ksh 1,500",
  Cupcake: "Ksh 1,800 / dozen",
  Cookie:  "Ksh 1,800 / batch",
  Special: "Ksh 9,000",
};

export default function ProductCard({ product, onConfigure }) {
  const [imgErr, setImgErr] = useState(false);
  const imageSrc = imgErr ? "/images/placeholder.jpg" : pickImage(product);
  const isConfigurable = CONFIGURABLE.includes(product.category);

  return (
    <div className="card group hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer"
      onClick={() => isConfigurable && onConfigure(product)}>

      {/* Image */}
      <div className="relative w-full h-52 bg-[#F2E0D0] overflow-hidden flex-shrink-0">
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
        <p className="text-gray-400 text-xs mb-3 flex-1 leading-relaxed">
          {CARD_BLURB[product.category] || product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F2E0D0]">
          <span className="text-[#6B3F1F] font-bold text-sm">
            {CARD_PRICE[product.category] || `Ksh ${Number(product.price).toLocaleString()}`}
          </span>
          {isConfigurable ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onConfigure(product); }}
              className="flex items-center gap-1.5 bg-[#6B3F1F] text-white px-4 py-2
                         rounded-lg text-sm font-semibold hover:bg-[#8B5A2B]
                         active:scale-95 transition-all"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Customise
            </button>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1 bg-[#6B3F1F] text-white px-4 py-2
                         rounded-lg text-sm font-semibold hover:bg-[#8B5A2B]
                         active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
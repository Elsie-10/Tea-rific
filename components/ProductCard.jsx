"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORY_EMOJI = {
  Cake: "🎂", Loaf: "🍞", Cupcake: "🧁",
  Cookie: "🍪", Special: "✨", Drink: "☕", Other: "🛒",
};

// Correct fallback image per category using actual filenames
const CATEGORY_FALLBACK = {
  Cake:    "/images/cake.jpeg",
  Loaf:    "/images/loaf1a.jpeg",
  Cupcake: "/images/cupcake1a.jpeg",
  Cookie:  "/images/cookies.jpeg",
  Special: "/images/celebrationcake1.jpeg",
  Other:   "/images/placeholder.jpg",
};

export default function ProductCard({ product }) {
  const { addItem }             = useCart();
  const { data: session }       = useSession();
  const router                  = useRouter();
  const [added, setAdded]       = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    if (!session) { router.push("/auth/login"); return; }
    addItem({ ...product, _id: product._id || product.id });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const imageSrc = imgError || !product?.image
    ? (CATEGORY_FALLBACK[product?.category] || "/images/placeholder.jpg")
    : product.image;

  return (
    <div className="card group hover:shadow-md transition-all duration-200 flex flex-col">

      {/* Image */}
      <div className="relative w-full h-52 bg-[#F2E0D0] overflow-hidden flex-shrink-0">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={() => setImgError(true)}
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-[#D4A843] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            Popular
          </span>
        )}
        <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-base px-2 py-0.5 rounded-full shadow-sm">
          {CATEGORY_EMOJI[product.category] || "🛒"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#4A7C59] font-semibold uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-serif text-[#2C2C2C] font-semibold text-base leading-snug mb-1">{product.name}</h3>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">{product.description}</p>

        {product.options?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.options.map((opt) => (
              <span key={opt} className="text-[10px] bg-[#FDF8F0] border border-[#F2E0D0] text-[#6B3F1F] px-2 py-0.5 rounded-full font-medium">
                {opt}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F2E0D0]">
          <span className="text-[#6B3F1F] font-bold text-lg">
            Ksh {product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-all duration-150 ${
              added ? "bg-[#4A7C59] text-white" : "bg-[#6B3F1F] text-white hover:bg-[#8B5A2B]"
            }`}
          >
            <Plus className="w-4 h-4" />
            {added ? "Added!" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
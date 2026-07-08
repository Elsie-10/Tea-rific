"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = ["All", "Cake", "Loaf", "Cupcake", "Cookie", "Special"];

// ── Fallback products using your EXACT image filenames ────────────────────
const FALLBACK_PRODUCTS = [
  // Cakes
  { _id:"fc-1",  name:"Classic Cake",         price:4000, category:"Cake",    featured:true,  image:"/images/cake.jpeg",              description:"Layered cake with swiss meringue butter cream frosting. Flavours: Vanilla, Chocolate, Carrot Cinnamon.",                options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { _id:"fc-2",  name:"Butter Cake",          price:4200, category:"Cake",    featured:false, image:"/images/cake2.jpeg",             description:"Soft buttery sponge with smooth cream frosting. Fillings: Lemon curd, Passion curd, Berry compote, Cream Cheese.",     options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { _id:"fc-3",  name:"Cream Cake",           price:4500, category:"Cake",    featured:false, image:"/images/cake4.jpeg",             description:"Rich cream cake with a velvety finish. Perfect for any gathering.",                                                       options:["Vanilla","Chocolate"] },
  { _id:"fc-4",  name:"Layered Cake",         price:6000, category:"Cake",    featured:false, image:"/images/cake4a.jpeg",            description:"A beautifully stacked layered cake with classic flavours and smooth frosting.",                                          options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { _id:"fc-5",  name:"Mini Cakes",           price:2600, category:"Cake",    featured:false, image:"/images/cakes1a.jpeg",           description:"Delightful mini cakes — perfect for intimate events and gifting.",                                                       options:["Vanilla","Chocolate"] },
  { _id:"fc-6",  name:"Berry Cake",           price:5000, category:"Cake",    featured:false, image:"/images/cakes2.jpeg",            description:"Fresh berry-inspired cake with a light and soft texture.",                                                             options:["Vanilla","Chocolate"] },
  // Loaves
  { _id:"fl-1",  name:"Single Loaf",          price:1500, category:"Loaf",    featured:true,  image:"/images/loaf1a.jpeg",            description:"Freshly baked loaf in your choice of flavour. Options: Vanilla, Chocolate, Chocolate Mint, Carrot Cinnamon, Banana.",   options:["Vanilla","Chocolate","Chocolate Mint","Carrot Cinnamon","Banana"] },
  { _id:"fl-2",  name:"Golden Loaf",          price:1500, category:"Loaf",    featured:false, image:"/images/loaf1b.jpeg",            description:"A rich loaf with a warm golden crust. Options: Vanilla, Chocolate, Chocolate Mint, Carrot Cinnamon, Banana.",           options:["Vanilla","Chocolate","Chocolate Mint","Carrot Cinnamon","Banana"] },
  { _id:"fl-3",  name:"Tea Loaf",             price:1500, category:"Loaf",    featured:false, image:"/images/loaf1c.jpeg",            description:"Perfect for tea time and light snacking. Options: Vanilla, Chocolate, Carrot Cinnamon, Banana.",                        options:["Vanilla","Chocolate","Carrot Cinnamon","Banana"] },
  { _id:"fl-4",  name:"Double Loaf",          price:3000, category:"Loaf",    featured:false, image:"/images/loafa.jpeg",             description:"Two freshly baked loaves in your choice of flavours.",                                                                  options:["Vanilla","Chocolate","Chocolate Mint","Carrot Cinnamon","Banana"] },
  // Cupcakes
  { _id:"fcu-1", name:"Cupcakes – Dozen",     price:1800, category:"Cupcake", featured:true,  image:"/images/cupcake1a.jpeg",         description:"A dozen (12 pieces) of butter cream frosted cupcakes. Perfect for birthdays and events.",                              options:[] },
  { _id:"fcu-2", name:"Cupcake Delight",      price:1800, category:"Cupcake", featured:false, image:"/images/cupcake1b.jpeg",         description:"Beautifully frosted cupcakes for every occasion.",                                                                     options:[] },
  { _id:"fcu-3", name:"Cupcake Bloom",        price:1800, category:"Cupcake", featured:false, image:"/images/cupcake1c.jpeg",         description:"Elegantly decorated cupcakes — as pretty as they are delicious.",                                                      options:[] },
  { _id:"fcu-4", name:"Cupcake Classic",      price:1800, category:"Cupcake", featured:false, image:"/images/cupcake1d.jpeg",         description:"Classic butter cream cupcakes baked fresh to order.",                                                                  options:[] },
  // Cookies
  { _id:"fco-1", name:"Cookies – Full Batch", price:1800, category:"Cookie",  featured:false, image:"/images/cookies.jpeg",           description:"A full batch of freshly baked cookies. Available in Chocolate Chip or Ginger.",                                         options:["Chocolate Chip","Ginger"] },
  // Specials
  { _id:"fs-1",  name:"Fruit Cake",           price:5000, category:"Special", featured:true,  image:"/images/fruitcake.jpeg",         description:"A rich, moist fruit cake packed with premium dried fruits. Great for celebrations and gifting.",                        options:[] },
  { _id:"fs-2",  name:"Fruit Cake Special",   price:5000, category:"Special", featured:false, image:"/images/fruitcake1.jpeg",        description:"A festive fruitcake with a premium finish — ideal for the holiday season.",                                            options:[] },
  { _id:"fs-3",  name:"Celebration Cake",     price:9000, category:"Special", featured:true,  image:"/images/celebrationcake1.jpeg",  description:"Our showstopper large celebration cake — ideal for weddings, milestones, and big birthdays.",                          options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { _id:"fs-4",  name:"Celebration Deluxe",   price:9000, category:"Special", featured:false, image:"/images/celebrationcake1a.jpeg", description:"A deluxe celebration cake styled for elegant tables.",                                                                 options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { _id:"fs-5",  name:"Celebration Two-Tier", price:9000, category:"Special", featured:false, image:"/images/celebrationcake2.jpeg",  description:"Gorgeous two-tier style celebration cake for big occasions.",                                                           options:["Vanilla","Chocolate"] },
  { _id:"fs-6",  name:"Celebration Bloom",    price:9000, category:"Special", featured:false, image:"/images/celebrationcake2a.jpeg", description:"A festive cake with a refined floral appearance.",                                                                     options:["Vanilla","Chocolate"] },
  { _id:"fs-7",  name:"Celebration Classic",  price:9000, category:"Special", featured:false, image:"/images/Celebrationcake3a.jpeg", description:"Classic celebration cake with a smooth and elegant finish.",                                                            options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { _id:"fs-8",  name:"Celebration Premium",  price:9000, category:"Special", featured:false, image:"/images/celebrationcake3b.jpeg", description:"Decorated for a premium, sophisticated look.",                                                                         options:["Vanilla","Chocolate"] },
  { _id:"fs-9",  name:"Celebration Joy",      price:9000, category:"Special", featured:false, image:"/images/celebrationcake3c.jpeg", description:"Bright and celebratory — for any occasion that deserves the best.",                                                    options:["Vanilla","Chocolate","Carrot Cinnamon"] },
];

export default function HomePage() {
  const [products, setProducts]   = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    let mounted = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const visible = activeTab === "All"
    ? products
    : products.filter((p) => p.category === activeTab);

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#6B3F1F] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="text-center lg:text-left">
            <p className="text-[#D4A843] text-sm font-semibold uppercase tracking-widest mb-3">Freshly Baked Daily</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 leading-tight">Tea-rific Treats</h1>
            <p className="text-[#F2E0D0] text-lg max-w-xl mx-auto lg:mx-0 mb-2">
              Artisan cakes, loaves, cupcakes & cookies — order online and pay securely with M-Pesa.
            </p>
            <p className="text-[#D4A843] text-sm mt-3">
              📞 0720 216 244 &nbsp;·&nbsp; Orders 24 hrs in advance &nbsp;·&nbsp; 50% deposit required
            </p>
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
              <a href="#menu" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#6B3F1F] transition hover:bg-[#F2E0D0]">
                View Menu
              </a>
              <a href="/checkout" className="rounded-full border border-[#D4A843] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7E4A23]">
                Order Now
              </a>
            </div>
          </div>
          <div id="menu" className="overflow-hidden rounded-[2rem] border border-[#D4A843]/40 shadow-xl">
            <Image src="/images/Backery0.jpeg" alt="Tea-rific bakery menu" width={1200} height={800} priority className="h-full w-full object-cover" />
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
                activeTab === cat ? "bg-[#6B3F1F] text-white" : "bg-[#FDF8F0] text-gray-600 hover:bg-[#F2E0D0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-full h-48 bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-5 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🧁</p>
            <p className="text-lg font-semibold">No items in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visible.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-16 bg-[#FDF8F0] border border-[#D4A843] rounded-2xl p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-[#6B3F1F] mb-2">Terms & Conditions</h3>
          <p className="text-gray-600 text-sm">
            For the best experience, please order <strong>24 hours in advance</strong> with a{" "}
            <strong>50% deposit</strong>. Extra charges apply for additional items and delivery.
          </p>
        </div>
      </main>

      <footer className="border-t border-[#F2E0D0] py-8 text-center text-sm text-gray-400 bg-white">
        <p className="font-serif text-[#6B3F1F] font-bold text-lg mb-1">Tea-Terrific Bakery</p>
        <p>📞 <a href="tel:0720216244" className="hover:underline">0720 216 244</a></p>
        <p className="mt-2">© {new Date().getFullYear()} Tea-Terrific Bakery. Made with ♥ in Nairobi.</p>
      </footer>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Send, Star, MessageCircle, Loader } from "lucide-react";

const VALUES = [
  { emoji: "🌿", title: "Always Fresh",      body: "Every order is baked fresh — nothing is pre-made or stored overnight. What you receive is warm, soft, and made with your occasion in mind." },
  { emoji: "🎨", title: "Made for You",      body: "You choose the flavour, the filling, the size. We don't do one-size-fits-all. Every bake is personal, built around exactly what you are dreaming of." },
  { emoji: "💛", title: "Baked with Heart", body: "Tea-rific grew from a genuine love of bringing people joy through food. That feeling goes into every layer, every swirl of frosting, every cookie." },
  { emoji: "🎉", title: "For Every Moment", body: "Birthdays, weddings, baby showers, office parties, or just a Tuesday — we believe every day is worth celebrating with something delicious." },
];

const GALLERY = [
  { src: "/images/celebrationcake1.jpeg", alt: "Celebration cake" },
  { src: "/images/cupcake1a.jpeg",        alt: "Cupcakes" },
  { src: "/images/loaf1a.jpeg",           alt: "Fresh loaf" },
  { src: "/images/fruitcake.jpeg",        alt: "Fruit cake" },
  { src: "/images/cake.jpeg",             alt: "Layered cake" },
  { src: "/images/cookies.jpeg",          alt: "Cookies" },
];

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60)    return "just now";
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["bg-[#6B3F1F]","bg-[#4A7C59]","bg-[#D4A843]","bg-blue-500","bg-purple-500","bg-pink-500"];
function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function AboutPage() {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [loadingC, setLoadingC] = useState(true);
  const [body, setBody]         = useState("");
  const [posting, setPosting]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const fetchComments = async () => {
    try {
      const res  = await fetch("/api/comments");
      const data = await res.json();
      if (data.success) setComments(data.data);
    } finally { setLoadingC(false); }
  };

  useEffect(() => { fetchComments(); }, []);

  const handlePost = async () => {
    setError("");
    if (!body.trim()) { setError("Please write something before posting."); return; }
    setPosting(true);
    const res  = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    setPosting(false);
    if (!data.success) { setError(data.error); return; }
    setBody("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    fetchComments();
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#6B3F1F] text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#D4A843] text-sm font-semibold uppercase tracking-widest mb-4">Hi, we are so glad you are here 👋</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight">The Tea-rific Story</h1>
          <p className="text-[#F2E0D0] text-lg leading-relaxed">
            Tea-rific Treats started in a small Nairobi kitchen with one big dream — to turn ordinary days into something worth celebrating.
            What began as a deep love for mixing, frosting, and sharing has grown into a home bakery that families and friends across Nairobi
            trust for their biggest and most personal moments.
          </p>
          <p className="text-[#F2E0D0] text-lg leading-relaxed mt-4">
            Every cake, loaf, cupcake, and cookie is made by hand, to order, with real ingredients and a level of care you can taste in every single bite.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-3">What We Do</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            We bake artisan cakes, loaves, cupcakes, cookies, and celebration specials — all from scratch, all made to order.
            No shortcuts, no preservatives, no compromise.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ emoji, title, body }) => (
            <div key={title} className="bg-white border border-[#F2E0D0] rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="text-5xl mb-4">{emoji}</div>
              <h3 className="font-serif text-lg font-bold text-[#6B3F1F] mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white border-t border-[#F2E0D0] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-3">Our Bakes</h2>
            <p className="text-gray-500">A glimpse of what comes out of our kitchen.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map(({ src, alt }) => (
              <div key={src} className="relative h-56 md:h-72 rounded-2xl overflow-hidden group">
                <img
                  src={src} alt={alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = "/images/placeholder.jpg"; }}
                />
                <div className="absolute inset-0 bg-[#6B3F1F]/0 group-hover:bg-[#6B3F1F]/20 transition-all duration-300 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="bg-[#6B3F1F] py-16 px-4 text-white text-center">
        <h2 className="font-serif text-3xl font-bold mb-3">Want to place an order?</h2>
        <p className="text-[#F2E0D0] mb-2">
          Orders must be placed <strong className="text-[#D4A843]">24 hours in advance</strong> with a <strong className="text-[#D4A843]">50% deposit</strong>.
        </p>
        <p className="text-[#F2E0D0] mb-8 text-sm">Extra charges apply for additional items and delivery.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/" className="bg-[#D4A843] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#C09535] transition-all">
            Browse the Menu
          </Link>
          <a href="tel:0720216244" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#6B3F1F] transition-all">
            📞 0720 216 244
          </a>
        </div>
      </section>

      {/* Comments Section */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <MessageCircle className="w-10 h-10 text-[#D4A843] mx-auto mb-3" />
          <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">What Our Customers Say</h2>
          <p className="text-gray-500 text-sm">Signed-in customers can leave a comment — visible to everyone.</p>
        </div>

        {/* Post form — customers only */}
        {session && session.user.role !== "owner" ? (
          <div className="bg-white border border-[#F2E0D0] rounded-2xl p-6 mb-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarColor(session.user.name)}`}>
                {getInitials(session.user.name)}
              </div>
              <p className="text-sm font-semibold text-[#2C2C2C]">
                Posting as <span className="text-[#6B3F1F]">{session.user.name}</span>
              </p>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Share your experience with Tea-Terrific…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#D4A843] bg-[#FDF8F0]"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{body.length}/500</span>
              <div>
                {error   && <p className="text-red-500 text-xs">{error}</p>}
                {success && <p className="text-[#4A7C59] text-xs font-semibold">✓ Comment posted!</p>}
              </div>
            </div>
            <button
              onClick={handlePost}
              disabled={posting || !body.trim()}
              className="mt-3 flex items-center gap-2 bg-[#6B3F1F] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#8B5A2B] disabled:opacity-50 transition-all"
            >
              {posting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {posting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        ) : !session ? (
          <div className="bg-[#FDF8F0] border border-[#F2E0D0] rounded-2xl p-6 mb-10 text-center">
            <p className="text-gray-500 text-sm mb-4">Sign in to share your experience with Tea-Terrific.</p>
            <Link href="/auth/login" className="inline-block bg-[#6B3F1F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8B5A2B] transition-all">
              Sign in to comment
            </Link>
          </div>
        ) : null}

        {/* Comments list */}
        {loadingC ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#F2E0D0] animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Star className="w-10 h-10 mx-auto mb-3 text-[#D4A843]" />
            <p className="font-semibold">No comments yet.</p>
            <p className="text-sm mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-white border border-[#F2E0D0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarColor(c.user_name)}`}>
                    {getInitials(c.user_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2C2C2C]">{c.user_name}</p>
                    <p className="text-xs text-gray-400">{timeAgo(c.created_at)}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F2E0D0] py-8 text-center text-sm text-gray-400 bg-white">
        <p className="font-serif text-[#6B3F1F] font-bold text-lg mb-1">Tea-rific Bakery</p>
        <p>📞 <a href="tel:0720216244" className="hover:underline">0720 216 244</a></p>
        <p className="mt-2">© {new Date().getFullYear()} Tea-rific Bakery. Made with ♥ in Nairobi.</p>
      </footer>
    </div>
  );
}

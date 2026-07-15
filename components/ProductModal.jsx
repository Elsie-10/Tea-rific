"use client";

import { useState } from "react";
import { X, Plus, Minus, ShoppingCart, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ── Helpers ───────────────────────────────────────────────────────────────

const CAKE_FLAVOURS = ["Vanilla", "Chocolate", "Carrot Cinnamon"];

const CAKE_SIZES = [
  { label: "1 Kg",   weight: "1kg",  price: 4000, serves: "8–10 people" },
  { label: "1½ Kg",  weight: "1.5kg", price: 6000, serves: "12–15 people" },
  { label: "2 Kg",   weight: "2kg",  price: 8000, serves: "18–22 people" },
];

const CAKE_FILLINGS = [
  { label: "None (SMBC only)", value: "none" },
  { label: "Lemon Curd",       value: "lemon_curd" },
  { label: "Passion Curd",     value: "passion_curd" },
  { label: "Orange Curd",      value: "orange_curd" },
  { label: "Strawberry",       value: "strawberry" },
  { label: "Blueberry",        value: "blueberry" },
  { label: "Berry Compote",    value: "berry_compote" },
  { label: "Cream Cheese",     value: "cream_cheese" },
];

const LOAF_FLAVOURS = [
  "Vanilla", "Banana", "Chocolate", "Chocolate Mint", "Carrot Cinnamon",
];

const LOAF_SIZES = [
  { label: "Single Loaf", price: 1500 },
  { label: "Double Loaf", price: 3000 },
];

const COOKIE_TYPES = [
  { label: "Chocolate Chip", image: "/images/cookies.jpeg" },
  { label: "Ginger",         image: "/images/ginger_cookies.jpeg" },
];

// ── Sub-components ────────────────────────────────────────────────────────

function SelectPill({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const label = typeof opt === "string" ? opt : opt.label;
        const val   = typeof opt === "string" ? opt : opt.value ?? opt.label;
        const active = value === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              active
                ? "bg-[#6B3F1F] text-white border-[#6B3F1F]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#6B3F1F]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children, sub }) {
  return (
    <div className="mb-2">
      <p className="text-sm font-bold text-[#2C2C2C]">{children}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Cake Modal ────────────────────────────────────────────────────────────

function CakeModal({ onClose, onAdd }) {
  const [flavour, setFlavour] = useState(CAKE_FLAVOURS[0]);
  const [size,    setSize]    = useState(CAKE_SIZES[0]);
  const [filling, setFilling] = useState("none");
  const [qty,     setQty]     = useState(1);

  const fillingLabel = CAKE_FILLINGS.find((f) => f.value === filling)?.label || "None";
  const total = size.price * qty;

  const handleAdd = () => {
    const description = [
      `Flavour: ${flavour}`,
      `Frosting: Swiss Meringue Buttercream (SMBC)`,
      filling !== "none" ? `Filling: ${fillingLabel} (+additional)` : "No extra filling",
    ].join(" · ");

    onAdd({
      name:        `Cake – ${size.label} (${flavour})`,
      price:       size.price,
      quantity:    qty,
      category:    "Cake",
      image:       "/images/cake.jpeg",
      description,
      customNote:  `${flavour} cake, ${size.label}, SMBC frosting${filling !== "none" ? `, ${fillingLabel} filling` : ""}`,
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Flavour */}
      <div>
        <SectionLabel sub="All cakes use Swiss Meringue Buttercream (SMBC) frosting">
          Choose Flavour
        </SectionLabel>
        <SelectPill options={CAKE_FLAVOURS} value={flavour} onChange={setFlavour} />
      </div>

      {/* Size */}
      <div>
        <SectionLabel>Choose Size</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {CAKE_SIZES.map((s) => (
            <button
              key={s.weight}
              type="button"
              onClick={() => setSize(s)}
              className={`p-3 rounded-xl border text-center transition-all ${
                size.weight === s.weight
                  ? "bg-[#6B3F1F] text-white border-[#6B3F1F]"
                  : "bg-white border-gray-200 hover:border-[#6B3F1F]"
              }`}
            >
              <p className="font-bold text-sm">{s.label}</p>
              <p className={`text-xs mt-0.5 ${size.weight === s.weight ? "text-[#F2E0D0]" : "text-gray-400"}`}>
                {s.serves}
              </p>
              <p className={`text-sm font-bold mt-1 ${size.weight === s.weight ? "text-[#D4A843]" : "text-[#6B3F1F]"}`}>
                Ksh {s.price.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Filling */}
      <div>
        <SectionLabel sub="Filling is an additional cost — the owner will confirm the price">
          Add a Filling (optional)
        </SectionLabel>
        <SelectPill
          options={CAKE_FILLINGS}
          value={filling}
          onChange={setFilling}
        />
      </div>

      {/* Summary box */}
      <div className="bg-[#FDF8F0] border border-[#F2E0D0] rounded-xl p-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Flavour</span>
          <span className="font-semibold text-[#2C2C2C]">{flavour}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Size</span>
          <span className="font-semibold text-[#2C2C2C]">{size.label}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Frosting</span>
          <span className="font-semibold text-[#2C2C2C]">SMBC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Filling</span>
          <span className="font-semibold text-[#2C2C2C]">{fillingLabel}</span>
        </div>
        {filling !== "none" && (
          <p className="text-xs text-[#D4A843] pt-1">
            ⚠ Filling is charged additionally — the owner will confirm cost.
          </p>
        )}
      </div>

      {/* Qty + Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold w-4 text-center">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#6B3F1F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8B5A2B] transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          Add · Ksh {total.toLocaleString()}
        </button>
      </div>
    </div>
  );
}

// ── Loaf Modal ────────────────────────────────────────────────────────────

function LoafModal({ onClose, onAdd }) {
  const [flavour, setFlavour] = useState(LOAF_FLAVOURS[0]);
  const [size,    setSize]    = useState(LOAF_SIZES[0]);
  const [qty,     setQty]     = useState(1);

  const handleAdd = () => {
    onAdd({
      name:       `${size.label} (${flavour})`,
      price:      size.price,
      quantity:   qty,
      category:   "Loaf",
      image:      "/images/loaf1a.jpeg",
      customNote: `${flavour} loaf, ${size.label}`,
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Choose Flavour</SectionLabel>
        <SelectPill options={LOAF_FLAVOURS} value={flavour} onChange={setFlavour} />
      </div>

      <div>
        <SectionLabel>Choose Size</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {LOAF_SIZES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSize(s)}
              className={`p-4 rounded-xl border text-center transition-all ${
                size.label === s.label
                  ? "bg-[#6B3F1F] text-white border-[#6B3F1F]"
                  : "bg-white border-gray-200 hover:border-[#6B3F1F]"
              }`}
            >
              <p className="font-bold">{s.label}</p>
              <p className={`text-sm font-bold mt-1 ${size.label === s.label ? "text-[#D4A843]" : "text-[#6B3F1F]"}`}>
                Ksh {s.price.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold w-4 text-center">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button type="button" onClick={handleAdd}
          className="flex items-center gap-2 bg-[#6B3F1F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8B5A2B] transition-all">
          <ShoppingCart className="w-4 h-4" />
          Add · Ksh {(size.price * qty).toLocaleString()}
        </button>
      </div>
    </div>
  );
}

// ── Celebration Cake Modal ────────────────────────────────────────────────

function CelebrationModal({ onClose, onAdd }) {
  const [occasion,  setOccasion]  = useState("");
  const [flavour,   setFlavour]   = useState("");
  const [filling,   setFilling]   = useState("none");
  const [guestCount,setGuestCount]= useState("");
  const [note,      setNote]      = useState("");
  const [errors,    setErrors]    = useState({});

  const occasions = [
    "Corporate Birthday", "Farewell Party", "Team Lunch",
    "Family Gathering", "Bible Study", "Wedding", "Other",
  ];

  const validate = () => {
    const e = {};
    if (!occasion)         e.occasion  = "Please select an occasion.";
    if (!flavour)          e.flavour   = "Please choose a flavour.";
    if (!guestCount || isNaN(Number(guestCount)) || Number(guestCount) < 1)
      e.guestCount = "Please enter expected number of guests.";
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const fillingLabel = CAKE_FILLINGS.find((f) => f.value === filling)?.label || "None";
    const customNote = [
      `Occasion: ${occasion}`,
      `Flavour: ${flavour}`,
      `Frosting: SMBC`,
      filling !== "none" ? `Filling: ${fillingLabel}` : "",
      `Guests: ${guestCount}`,
      note ? `Special requests: ${note}` : "",
    ].filter(Boolean).join(" · ");

    onAdd({
      name:       "Large Celebration Cake (4 Kg)",
      price:      9000,
      quantity:   1,
      category:   "Special",
      image:      "/images/celebrationcake1.jpeg",
      customNote,
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-[#6B3F1F] text-white rounded-xl p-4 text-sm">
        <p className="font-bold text-base mb-1">4 Kg · Serves 70+ people</p>
        <p className="text-[#F2E0D0]">
          Perfect for corporates (birthdays, farewells, team lunches) and families
          (gatherings, bible studies, celebrations). Tell us exactly what you need.
        </p>
        <p className="text-[#D4A843] font-bold mt-2">Ksh 9,000</p>
      </div>

      {/* Occasion */}
      <div>
        <SectionLabel>What is the occasion?</SectionLabel>
        <SelectPill options={occasions} value={occasion} onChange={setOccasion} />
        {errors.occasion && <p className="text-red-500 text-xs mt-1">{errors.occasion}</p>}
      </div>

      {/* Flavour */}
      <div>
        <SectionLabel>Cake Flavour</SectionLabel>
        <SelectPill options={CAKE_FLAVOURS} value={flavour} onChange={setFlavour} />
        {errors.flavour && <p className="text-red-500 text-xs mt-1">{errors.flavour}</p>}
      </div>

      {/* Filling */}
      <div>
        <SectionLabel sub="Filling is an additional cost — the owner will confirm">
          Add a Filling (optional)
        </SectionLabel>
        <SelectPill options={CAKE_FILLINGS} value={filling} onChange={setFilling} />
      </div>

      {/* Guest count */}
      <div>
        <SectionLabel>Expected Number of Guests</SectionLabel>
        <input
          type="number"
          min="1"
          placeholder="e.g. 80"
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          className="input-field w-40"
        />
        {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount}</p>}
      </div>

      {/* Special requests */}
      <div>
        <SectionLabel sub="Decoration, theme, inscription, colours, dietary needs…">
          Special Requests (optional)
        </SectionLabel>
        <textarea
          rows={3}
          maxLength={400}
          placeholder="e.g. Blue and gold theme, write 'Happy 50th Sarah', no nuts…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input-field resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{note.length}/400</p>
      </div>

      <button type="button" onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 bg-[#6B3F1F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8B5A2B] transition-all">
        <ShoppingCart className="w-4 h-4" />
        Add to Order · Ksh 9,000
      </button>
    </div>
  );
}

// ── Cookie Modal ──────────────────────────────────────────────────────────

function CookieModal({ onClose, onAdd }) {
  const [type, setType] = useState(null);
  const [qty,  setQty]  = useState(1);
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!type) { setError("Please choose a cookie type."); return; }
    onAdd({
      name:       `Cookies – Full Batch (${type.label})`,
      price:      1800,
      quantity:   qty,
      category:   "Cookie",
      image:      type.image,
      customNote: `${type.label} cookies, full batch`,
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel sub="Full batch · Ksh 1,800">Choose Cookie Type</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          {COOKIE_TYPES.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => { setType(c); setError(""); }}
              className={`rounded-2xl border-2 overflow-hidden transition-all ${
                type?.label === c.label
                  ? "border-[#6B3F1F] shadow-md"
                  : "border-gray-200 hover:border-[#6B3F1F]"
              }`}
            >
              <div className="h-36 w-full overflow-hidden">
                <img
                  src={c.image}
                  alt={c.label}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = "/images/placeholder.jpg"; }}
                />
              </div>
              <div className={`py-2 text-sm font-bold ${
                type?.label === c.label ? "bg-[#6B3F1F] text-white" : "bg-white text-[#2C2C2C]"
              }`}>
                {c.label}
              </div>
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold w-4 text-center">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button type="button" onClick={handleAdd}
          className="flex items-center gap-2 bg-[#6B3F1F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8B5A2B] transition-all">
          <ShoppingCart className="w-4 h-4" />
          Add · Ksh {(1800 * qty).toLocaleString()}
        </button>
      </div>
    </div>
  );
}

// ── Cupcake Modal ─────────────────────────────────────────────────────────

function CupcakeModal({ onClose, onAdd }) {
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    onAdd({
      name:       "Cupcakes – Dozen (12 pcs)",
      price:      1800,
      quantity:   qty,
      category:   "Cupcake",
      image:      "/images/cupcake1a.jpeg",
      customNote: "Butter cream frosted cupcakes, dozen",
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FDF8F0] border border-[#F2E0D0] rounded-xl p-4">
        <p className="font-bold text-[#2C2C2C]">Butter Cream Frosted Cupcakes</p>
        <p className="text-sm text-gray-500 mt-1">
          A dozen (12 pieces) of beautifully frosted cupcakes. Perfect for birthdays,
          events, office treats, or gifting.
        </p>
        <p className="text-[#6B3F1F] font-bold text-lg mt-2">Ksh 1,800 per dozen</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#2C2C2C] mb-2">Number of Dozens</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold">{qty} dozen ({qty * 12} pcs)</span>
            <button type="button" onClick={() => setQty((q) => q + 1)}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button type="button" onClick={handleAdd}
          className="flex items-center gap-2 bg-[#6B3F1F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8B5A2B] transition-all">
          <ShoppingCart className="w-4 h-4" />
          Add · Ksh {(1800 * qty).toLocaleString()}
        </button>
      </div>
    </div>
  );
}

// ── Main Modal Wrapper ────────────────────────────────────────────────────

export default function ProductModal({ product, onClose }) {
  const { addItem }         = useCart();
  const { data: session }   = useSession();
  const router              = useRouter();

  if (!product) return null;

  const handleAdd = (item) => {
    if (!session) { onClose(); router.push("/auth/login"); return; }
    addItem({ ...item, _id: `${item.category}-${Date.now()}` });
  };

  const MODALS = {
    Cake:    <CakeModal        onClose={onClose} onAdd={handleAdd} />,
    Loaf:    <LoafModal        onClose={onClose} onAdd={handleAdd} />,
    Special: <CelebrationModal onClose={onClose} onAdd={handleAdd} />,
    Cookie:  <CookieModal      onClose={onClose} onAdd={handleAdd} />,
    Cupcake: <CupcakeModal     onClose={onClose} onAdd={handleAdd} />,
  };

  const TITLES = {
    Cake:    "Customise Your Cake",
    Loaf:    "Choose Your Loaf",
    Special: "Large Celebration Cake",
    Cookie:  "Choose Your Cookies",
    Cupcake: "Cupcakes",
  };

  const IMAGES = {
    Cake:    "/images/cake.jpeg",
    Loaf:    "/images/loaf1a.jpeg",
    Special: "/images/celebrationcake1.jpeg",
    Cookie:  "/images/cookies.jpeg",
    Cupcake: "/images/cupcake1a.jpeg",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl
                      shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header image */}
        <div className="relative h-40 w-full overflow-hidden rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <img
            src={IMAGES[product.category] || "/images/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "/images/placeholder.jpg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D4A843]">
              {product.category}
            </p>
            <h2 className="font-serif text-xl font-bold">{TITLES[product.category]}</h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white
                       rounded-full p-1.5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {MODALS[product.category] || (
            <p className="text-gray-500 text-sm">No configurator for this product.</p>
          )}
        </div>
      </div>
    </div>
  );
}
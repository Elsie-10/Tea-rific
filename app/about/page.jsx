import Navbar from "@/components/Navbar";
import Link from "next/link";

const MENU_ITEMS = [
  {
    category: "🎂 Cakes",
    note: "Layered with swiss meringue butter cream frosting & filling of your choice.",
    sub: "Cake options: Vanilla · Chocolate · Carrot Cinnamon\nFilling options: Lemon curd · Passion curd · Orange curd · Berry compote · Cream Cheese",
    items: [
      { name: "1 Kg", price: "Ksh 4,000" },
      { name: "1½ Kg", price: "Ksh 6,000" },
      { name: "2 Kg", price: "Ksh 8,000" },
    ],
  },
  {
    category: "🍞 Loaves",
    note: "Loaf options: Vanilla · Chocolate · Chocolate Mint · Carrot Cinnamon · Banana",
    items: [
      { name: "Single Loaf", price: "Ksh 1,500" },
      { name: "Double Loaf", price: "Ksh 3,000" },
    ],
  },
  {
    category: "🧁 Cupcakes",
    note: "Butter cream frosted cupcakes.",
    items: [
      { name: "A dozen (12 pieces)", price: "Ksh 1,800" },
    ],
  },
  {
    category: "✨ Specials",
    items: [
      { name: "Fruit Cake", price: "Ksh 5,000" },
      { name: "Large Celebration Cake", price: "Ksh 9,000" },
    ],
  },
  {
    category: "🍪 Cookies",
    note: "Cookie options: Chocolate Chip · Ginger",
    items: [
      { name: "Full Batch", price: "Ksh 1,800" },
    ],
  },
];

const VALUES = [
  { emoji: "🌿", title: "Always Fresh",       body: "Nothing sits around here. Every order is baked fresh, so what arrives at your door is warm, soft, and full of flavour." },
  { emoji: "🎨", title: "Made for You",       body: "Pick your flavour, your filling, your size. We build every order around exactly what you're craving." },
  { emoji: "💛", title: "A Personal Touch",   body: "We treat every order like it's for our own family — because to us, you kind of are. That care is in every bite." },
  { emoji: "📦", title: "For Every Moment",   body: "Birthdays, weddings, baby showers, or just because — we'll help you make it sweeter." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#6B3F1F] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#D4A843] text-sm font-semibold uppercase tracking-widest mb-3">Hi, we're so glad you're here 👋</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-5 leading-tight">
            The Tea-Terrific Story
          </h1>
          <p className="text-[#F2E0D0] text-lg leading-relaxed max-w-2xl mx-auto">
            Tea-rific started in a small  kitchen with one big dream — to turn ordinary
            days into something worth celebrating, one bake at a time. What began as a love for
            mixing, frosting, and sharing has grown into a bakery families and friends trust for
            their biggest moments. Every cake, loaf, and cookie is still made the same way it always
            has been: with real ingredients, real care, and a little bit of magic.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] text-center mb-3">
          What Makes Us, Us
        </h2>
        <p className="text-gray-500 text-center max-w-xl mx-auto mb-10">
          A few things you can always count on when you order from Tea-Terrific.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ emoji, title, body }) => (
            <div key={title} className="card p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="text-4xl mb-4">{emoji}</div>
              <h3 className="font-serif text-lg font-bold text-[#6B3F1F] mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Full Menu */}
      <section className="bg-white py-16 px-4 border-t border-[#F2E0D0]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#D4A843] text-sm font-semibold uppercase tracking-widest text-center mb-2">
            Tea-rific Treats
          </p>
          <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] text-center mb-12">
            Our Full Menu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MENU_ITEMS.map(({ category, note, sub, items }) => (
              <div key={category} className="bg-[#FDF8F0] border border-[#F2E0D0] rounded-2xl p-6">
                <h3 className="font-serif text-xl font-bold text-[#6B3F1F] mb-1">{category}</h3>
                {note && <p className="text-gray-500 text-xs mb-1 leading-relaxed">{note}</p>}
                {sub  && (
                  <p className="text-gray-400 text-xs mb-3 leading-relaxed whitespace-pre-line">{sub}</p>
                )}
                <div className="divide-y divide-[#F2E0D0] mt-3">
                  {items.map(({ name, price }) => (
                    <div key={name} className="flex justify-between py-2">
                      <span className="text-sm text-[#2C2C2C]">{name}</span>
                      <span className="text-sm font-bold text-[#6B3F1F]">{price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Image gallery showcasing some bakery work */}
            <div className="bg-[#FDF8F0] border border-[#F2E0D0] rounded-2xl p-6">
              <h3 className="font-serif text-xl font-bold text-[#6B3F1F] mb-3">Our Work</h3>
              <p className="text-gray-500 text-xs mb-4">A selection of our cakes and loaves.</p>
              <div className="grid grid-cols-2 gap-2">
                <img src="/images/Backery10.jpeg" alt="Cake 1" className="w-full h-32 object-cover rounded-md" />
                <img src="/images/Backery11.jpeg" alt="Cake 2" className="w-full h-32 object-cover rounded-md" />
                <img src="/images/cakes3.jpeg" alt="Special cake" className="w-full h-32 object-cover rounded-md" />
                <img src="/images/cakes.jpeg" alt="Loaf" className="w-full h-32 object-cover rounded-md" />
              </div>
            </div>

            {/* Terms card */}
            <div className="bg-[#6B3F1F] text-white rounded-2xl p-6">
              <h3 className="font-serif text-xl font-bold mb-3">📋 Terms & Conditions</h3>
              <p className="text-[#F2E0D0] text-sm leading-relaxed">
                For the best experience, please order{" "}
                <strong className="text-[#D4A843]">24 hours in advance</strong> with a{" "}
                <strong className="text-[#D4A843]">50% deposit</strong>. Extra charges apply for
                additional items and delivery.
              </p>
              <div className="mt-5 pt-4 border-t border-[#8B5A2B]">
                <p className="text-xs text-[#F2E0D0] uppercase tracking-wider font-semibold mb-1">Get in touch</p>
                <a href="tel:0720216244" className="text-2xl font-bold text-[#D4A843] hover:underline">
                  0720 216 244
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#FDF8F0] py-16 px-4 border-t border-[#F2E0D0] text-center">
        <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-3">
          Let's bake something wonderful together 🍰
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Have a look at the menu, pick your favourites, and we'll take care of the rest. We can't
          wait to be part of your next celebration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">Browse the Menu</Link>
          <a href="tel:0720216244" className="btn-outline">📞 Call 0720 216 244</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F2E0D0] py-8 text-center text-sm text-gray-400 bg-white">
        <p className="font-serif text-[#6B3F1F] font-bold text-lg mb-1">Tea-Terrific Bakery</p>
        <p>📞 <a href="tel:0720216244" className="hover:underline">0720 216 244</a></p>
        <p className="mt-2">© {new Date().getFullYear()} Tea-Terrific Bakery. Made with ♥ in Nairobi.</p>
      </footer>
    </div>
  );
}
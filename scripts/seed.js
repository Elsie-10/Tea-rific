#!/usr/bin/env node
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌  Missing Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const force = process.argv.includes("--force");

const PRODUCTS = [
  // ── Cakes ──
  { name:"Cake – 1 Kg",               price:4000, category:"Cake",    featured:true,  available:true, image:"/images/cake.jpeg",              description:"Layered cake with swiss meringue butter cream frosting. Flavours: Vanilla, Chocolate, Carrot Cinnamon. Fillings: Lemon curd, Passion curd, Orange curd, Berry compote, Cream Cheese.", options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { name:"Cake – 1½ Kg",              price:6000, category:"Cake",    featured:false, available:true, image:"/images/cake2.jpeg",             description:"Layered cake with swiss meringue butter cream frosting. Flavours: Vanilla, Chocolate, Carrot Cinnamon. Fillings: Lemon curd, Passion curd, Orange curd, Berry compote, Cream Cheese.", options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { name:"Cake – 2 Kg",               price:8000, category:"Cake",    featured:false, available:true, image:"/images/cake4.jpeg",             description:"Layered cake with swiss meringue butter cream frosting. Flavours: Vanilla, Chocolate, Carrot Cinnamon. Fillings: Lemon curd, Passion curd, Orange curd, Berry compote, Cream Cheese.", options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  // ── Loaves ──
  { name:"Single Loaf",               price:1500, category:"Loaf",    featured:true,  available:true, image:"/images/loaf1a.jpeg",            description:"Freshly baked loaf. Options: Vanilla, Chocolate, Chocolate Mint, Carrot Cinnamon, Banana.", options:["Vanilla","Chocolate","Chocolate Mint","Carrot Cinnamon","Banana"] },
  { name:"Double Loaf",               price:3000, category:"Loaf",    featured:false, available:true, image:"/images/loafa.jpeg",             description:"Two freshly baked loaves. Options: Vanilla, Chocolate, Chocolate Mint, Carrot Cinnamon, Banana.", options:["Vanilla","Chocolate","Chocolate Mint","Carrot Cinnamon","Banana"] },
  // ── Cupcakes ──
  { name:"Cupcakes – Dozen (12 pcs)", price:1800, category:"Cupcake", featured:true,  available:true, image:"/images/cupcake1a.jpeg",         description:"A dozen (12 pieces) of butter cream frosted cupcakes. Perfect for birthdays and events.", options:[] },
  // ── Specials ──
  { name:"Fruit Cake",                price:5000, category:"Special", featured:true,  available:true, image:"/images/fruitcake.jpeg",         description:"A rich, moist fruit cake packed with premium dried fruits. Great for celebrations and gifting.", options:[] },
  { name:"Large Celebration Cake",    price:9000, category:"Special", featured:true,  available:true, image:"/images/celebrationcake1.jpeg",  description:"Our showstopper large celebration cake — ideal for weddings, milestones, and big birthdays.", options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  // ── Cookies ──
  { name:"Cookies – Full Batch",      price:1800, category:"Cookie",  featured:false, available:true, image:"/images/cookies.jpeg",           description:"A full batch of freshly baked cookies. Available in Chocolate Chip or Ginger.", options:["Chocolate Chip","Ginger"] },
];

async function seed() {
  console.log("🔌  Connecting to Supabase...\n");

  // Check tables
  const { error: tableCheck } = await supabase.from("users").select("id").limit(1);
  if (tableCheck) {
    console.error("❌  Supabase tables not set up. Run supabase/schema.sql first.");
    process.exit(1);
  }

  // Owner account
  const ownerEmail = "owner@teaterrific.com";
  const { data: existing } = await supabase.from("users").select("id").eq("email", ownerEmail).maybeSingle();
  if (!existing) {
    const hashed = await bcrypt.hash("Owner@2024!", 12);
    const { error } = await supabase.from("users").insert({
      name: "Tea-Terrific Owner", email: ownerEmail,
      password: hashed, role: "owner", phone: "0720216244",
    });
    if (error) { console.error("❌  Owner creation failed:", error.message); process.exit(1); }
    console.log("✅  Owner account created");
    console.log("    Email:    owner@teaterrific.com");
    console.log("    Password: Owner@2024!\n");
  } else {
    console.log("ℹ️   Owner already exists.\n");
  }

  // Products
  const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
  if (count === 0 || force) {
    if (force) {
      await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("🗑️   Cleared products.");
    }
    const { error } = await supabase.from("products").insert(PRODUCTS);
    if (error) { console.error("❌  Product seed failed:", error.message); process.exit(1); }
    console.log(`✅  ${PRODUCTS.length} products seeded.`);
    console.log("\n📸  Image assignments:");
    PRODUCTS.forEach(p => console.log(`    ${p.category.padEnd(10)} ${p.name.padEnd(30)} → ${p.image}`));
  } else {
    console.log(`ℹ️   ${count} products exist. Run with --force to re-seed.`);
  }

  console.log("\n🎉  Done!");
  console.log("    Owner login: owner@teaterrific.com / Owner@2024!");
}

seed().catch(err => { console.error("Seed error:", err.message); process.exit(1); });

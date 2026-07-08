#!/usr/bin/env node
/**
 * Tea-Terrific — Supabase Seed Script
 * Usage:            node scripts/seed.js
 * Re-seed products: node scripts/seed.js --force
 */

const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const force = process.argv.includes("--force");

const PRODUCTS = [
  // Cakes
  { name:"Cake – 1 Kg",               price:4000, category:"Cake",    featured:true,  image:"/images/cake.jpeg",              description:"Layered cake with swiss meringue butter cream frosting. Flavours: Vanilla, Chocolate, Carrot Cinnamon. Fillings: Lemon curd, Passion curd, Orange curd, Berry compote, Cream Cheese.", options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { name:"Cake – 1½ Kg",              price:6000, category:"Cake",    featured:false, image:"/images/cake2.jpeg",             description:"Layered cake with swiss meringue butter cream frosting. Flavours: Vanilla, Chocolate, Carrot Cinnamon. Fillings: Lemon curd, Passion curd, Orange curd, Berry compote, Cream Cheese.", options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  { name:"Cake – 2 Kg",               price:8000, category:"Cake",    featured:false, image:"/images/cake4.jpeg",             description:"Layered cake with swiss meringue butter cream frosting. Flavours: Vanilla, Chocolate, Carrot Cinnamon. Fillings: Lemon curd, Passion curd, Orange curd, Berry compote, Cream Cheese.", options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  // Loaves
  { name:"Single Loaf",               price:1500, category:"Loaf",    featured:true,  image:"/images/loaf1a.jpeg",            description:"Freshly baked loaf. Options: Vanilla, Chocolate, Chocolate Mint, Carrot Cinnamon, Banana.", options:["Vanilla","Chocolate","Chocolate Mint","Carrot Cinnamon","Banana"] },
  { name:"Double Loaf",               price:3000, category:"Loaf",    featured:false, image:"/images/loafa.jpeg",             description:"Two freshly baked loaves. Options: Vanilla, Chocolate, Chocolate Mint, Carrot Cinnamon, Banana.", options:["Vanilla","Chocolate","Chocolate Mint","Carrot Cinnamon","Banana"] },
  // Cupcakes
  { name:"Cupcakes – Dozen (12 pcs)", price:1800, category:"Cupcake", featured:true,  image:"/images/cupcake1a.jpeg",         description:"A dozen (12 pieces) of butter cream frosted cupcakes. Perfect for birthdays and events.", options:[] },
  // Specials
  { name:"Fruit Cake",                price:5000, category:"Special", featured:true,  image:"/images/fruitcake.jpeg",         description:"A rich, moist fruit cake packed with premium dried fruits. Great for celebrations and gifting.", options:[] },
  { name:"Large Celebration Cake",    price:9000, category:"Special", featured:true,  image:"/images/celebrationcake1.jpeg",  description:"Our showstopper large celebration cake — ideal for weddings, milestones, and big birthdays.", options:["Vanilla","Chocolate","Carrot Cinnamon"] },
  // Cookies
  { name:"Cookies – Full Batch",      price:1800, category:"Cookie",  featured:false, image:"/images/cookies.jpeg",           description:"A full batch of freshly baked cookies. Available in Chocolate Chip or Ginger.", options:["Chocolate Chip","Ginger"] },
];

async function seed() {
  console.log("🔌  Connecting to Supabase...\n");

  // Check tables exist
  const { error: tableCheck } = await supabase.from("users").select("id").limit(1);
  if (tableCheck) {
    console.error("❌  Supabase tables are not set up yet.");
    console.error("   Open the Supabase SQL Editor and run the SQL from supabase/schema.sql.");
    console.error("   Then rerun: npm run seed.");
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
    console.log("    Password: Owner@2024!");
    console.log("    ⚠️   Change this password after first login!\n");
  } else {
    console.log("ℹ️   Owner account already exists.\n");
  }

  // Products
  const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
  if (count === 0 || force) {
    if (force) {
      await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      console.log("🗑️   Cleared existing products.");
    }
    const { error } = await supabase.from("products").insert(PRODUCTS.map((p) => ({ ...p, available: true })));
    if (error) { console.error("❌  Product seeding failed:", error.message); process.exit(1); }
    console.log(`✅  ${PRODUCTS.length} products seeded.\n`);
    console.log("📸  Image mapping:");
    PRODUCTS.forEach((p) => console.log(`    ${p.image.padEnd(35)} → ${p.name}`));
  } else {
    console.log(`ℹ️   ${count} products already exist. Run with --force to re-seed.`);
  }

  console.log("\n🎉  Done! Owner login: owner@teaterrific.com / Owner@2024!");
}

seed().catch((err) => { console.error("Seed failed:", err.message); process.exit(1); });
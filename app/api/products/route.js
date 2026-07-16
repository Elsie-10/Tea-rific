export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    let query = supabase
      .from("products")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (featured === "true") query = query.eq("featured", true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "owner")
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });

    const body = await request.json();
    const { data, error } = await supabaseAdmin.from("products").insert(body).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
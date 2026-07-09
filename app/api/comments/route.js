import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/comments — public
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select("id, user_name, body, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      // Table doesn't exist yet — return empty list gracefully
      if (error.code === "42P01") {
        return NextResponse.json({ success: true, data: [] });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/comments — signed-in customers only
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to leave a comment." },
        { status: 401 }
      );
    }
    if (session.user.role === "owner") {
      return NextResponse.json(
        { success: false, error: "Owner accounts cannot post comments." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const trimmed = (body?.body || "").trim();

    if (!trimmed || trimmed.length < 3) {
      return NextResponse.json(
        { success: false, error: "Comment is too short — please write at least 3 characters." },
        { status: 400 }
      );
    }
    if (trimmed.length > 500) {
      return NextResponse.json(
        { success: false, error: "Comment must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("comments")
      .insert({
        user_id:   session.user.id   || null,
        user_name: session.user.name || "Customer",
        body:      trimmed,
      })
      .select("id, user_name, body, created_at")
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { success: false, error: "Comments table not set up yet. Please run the schema SQL in Supabase." },
          { status: 503 }
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
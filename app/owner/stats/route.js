import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not signed in." },
        { status: 401 }
      );
    }

    if (session.user.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "Owner access only." },
        { status: 403 }
      );
    }

    const [total, pending, preparing, completed, revenue] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("order_status", "Pending"),
      supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("order_status", "Preparing"),
      supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("order_status", "Completed"),
      supabaseAdmin
        .from("orders")
        .select("total")
        .eq("payment_status", "Paid"),
    ]);

    const totalRevenue = (revenue.data || []).reduce(
      (sum, o) => sum + Number(o.total),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        totalOrders:     total.count     || 0,
        pendingOrders:   pending.count   || 0,
        preparingOrders: preparing.count || 0,
        completedOrders: completed.count || 0,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("GET /api/owner/stats crashed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/orders/:id — returns full order with items for tracking page
export async function GET(_, { params }) {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", params.id)
      .single();

    if (error || !data)
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/orders/:id — owner updates status
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "owner")
      return NextResponse.json({ success: false, error: "Owner access only." }, { status: 403 });

    const body = await request.json();
    const update = {};
    if (body.orderStatus)   update.order_status   = body.orderStatus;
    if (body.paymentStatus) update.payment_status = body.paymentStatus;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(update)
      .eq("id", params.id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

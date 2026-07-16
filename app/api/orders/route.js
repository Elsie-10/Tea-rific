export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, phone, location, items, total, userId } = body;

    if (!customerName?.trim())
      return NextResponse.json({ success: false, error: "Customer name is required." }, { status: 400 });
    if (!phone?.trim())
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    if (!location?.trim())
      return NextResponse.json({ success: false, error: "Delivery location is required." }, { status: 400 });
    if (!items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ success: false, error: "Order must have at least one item." }, { status: 400 });
    if (!total || Number(total) <= 0)
      return NextResponse.json({ success: false, error: "Order total is invalid." }, { status: 400 });

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name:  customerName.trim(),
        phone:          phone.trim(),
        location:       location.trim(),
        total:          Number(total),
        user_id:        userId || null,
        payment_status: "Pending",
        order_status:   "Pending",
      })
      .select()
      .single();

    if (orderErr) {
      console.error("Order insert error:", orderErr);
      return NextResponse.json({ success: false, error: orderErr.message }, { status: 500 });
    }

    const orderItems = items.map((i) => {
      const rawId = i.productId || i.id || i._id || null;
      const isUUID = rawId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);
      return {
        order_id:    order.id,
        product_id:  isUUID ? rawId : null,
        name:        String(i.name),
        price:       Number(i.price),
        quantity:    Number(i.quantity),
        image:       i.image      || null,
        custom_note: i.customNote || null,
      };
    });

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsErr) {
      console.error("Order items error:", itemsErr.message);
      return NextResponse.json({
        success: false,
        error: `Order created but items failed: ${itemsErr.message}`,
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });

  } catch (err) {
    console.error("POST /api/orders crashed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session)
      return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
    if (session.user.role !== "owner")
      return NextResponse.json({ success: false, error: "Owner access only." }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page   = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit  = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const from   = (page - 1) * limit;

    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (status && status !== "All")
      query = query.eq("order_status", status);

    const { data, error, count } = await query;

    if (error) {
      console.error("GET /api/orders error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (err) {
    console.error("GET /api/orders crashed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
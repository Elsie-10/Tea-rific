import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { formatPhoneNumber, initiateStkPush, validateMpesaConfig } from "@/lib/mpesa";

export async function POST(request) {
  let orderIdForFailureUpdate = null;
  try {
    const { phone, amount, orderId } = await request.json();
    orderIdForFailureUpdate = orderId;
    if (!phone || !amount || !orderId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }
    const config = validateMpesaConfig();
    if (!config.isValid) {
      return NextResponse.json(
        { success: false, error: `M-Pesa configuration missing: ${config.missing.join(", ")}` },
        { status: 500 }
      );
    }

    const { data: order, error } = await supabaseAdmin.from("orders").select("id").eq("id", orderId).maybeSingle();
    if (error || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const normalizedPhone = formatPhoneNumber(phone);
    const stkResponse = await initiateStkPush({ phone: normalizedPhone, amount: numericAmount, orderId });

    await supabaseAdmin
      .from("orders")
      .update({
        checkout_request_id: stkResponse.CheckoutRequestID,
        payment_status: "Pending",
      })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      message: "STK Push sent. Check your phone.",
      CheckoutRequestID: stkResponse.CheckoutRequestID,
      CustomerMessage: stkResponse.CustomerMessage || null,
    });
  } catch (err) {
    console.error("POST /api/mpesa/stkpush error:", err);
    if (orderIdForFailureUpdate) {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "Failed" })
        .eq("id", orderIdForFailureUpdate);
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

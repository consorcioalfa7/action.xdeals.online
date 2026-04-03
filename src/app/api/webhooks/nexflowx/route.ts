import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { orderNumber, status, nexflowxId, signature } = body;

    // Basic signature verification
    const webhookSecret = process.env.NEXFLOWX_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSig = Buffer.from(
        `${nexflowxId}:${webhookSecret}`
      ).toString("base64");
      if (signature !== expectedSig) {
        console.warn("Webhook signature verification failed");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    if (!orderNumber || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find order by order number
    const order = await db.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    if (status === "paid" || status === "completed") {
      await db.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          nexflowxId: nexflowxId || order.nexflowxId,
        },
      });

      return NextResponse.json({ success: true, message: "Order marked as paid" });
    }

    if (status === "failed" || status === "cancelled") {
      await db.order.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          nexflowxId: nexflowxId || order.nexflowxId,
        },
      });

      return NextResponse.json({ success: true, message: "Order cancelled" });
    }

    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

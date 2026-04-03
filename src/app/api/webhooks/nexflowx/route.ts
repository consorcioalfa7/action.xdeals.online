import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/webhooks/nexflowx ──────────────────────────────
// Recebe confirmações de pagamento da NeXFlowX.
// Actualiza o status do pedido na base de dados.
// Sempre retorna 200 OK para evitar reenvios.
// ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: Record<string, unknown>;

    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error("[Webhook] Failed to parse body as JSON");
      return NextResponse.json({ received: true, error: "Invalid JSON" });
    }

    console.log("══════════════════════════════════════════════════");
    console.log("[NeXFlowX Webhook] Payment notification received");
    console.log("[NeXFlowX Webhook] Body:", JSON.stringify(body, null, 2));
    console.log("══════════════════════════════════════════════════");

    // ── Extract fields from NeXFlowX payload ────────────────
    // NeXFlowX sends: { id, status, amount, currency, metadata?, description?, ... }
    const transaction_id = String(body.id || body.transaction_id || body.nexflowx_id || body.payment_id || "");
    const status = String(body.status || "unknown").toLowerCase();
    const amount = body.amount;
    const currency = body.currency;

    // Extract order number from description (format: "Fatura #ACT-XXX - C.Euro2026")
    const description = String(body.description || body.reference || body.order_number || "");
    const orderMatch = description.match(/#([A-Z0-9-]+)/i);
    const orderNumber = orderMatch ? orderMatch[1] : String(body.orderNumber || body.order_number || body.metadata?.orderNumber || "");

    console.log(`[Webhook] transaction_id: ${transaction_id || "N/A"}`);
    console.log(`[Webhook] status: ${status}`);
    console.log(`[Webhook] amount: ${amount || "N/A"} ${currency || ""}`);
    console.log(`[Webhook] orderNumber: ${orderNumber || "N/A"}`);

    // ── Try to update order in database ─────────────────────
    try {
      const { db } = await import("@/lib/db");

      let updated = false;

      // Strategy 1: Find by nexflowxId
      if (transaction_id) {
        const order = await db.order.findFirst({
          where: { nexflowxId: transaction_id },
        });
        if (order) {
          await updateOrderStatus(db, order.id, order.orderNumber, status, transaction_id);
          updated = true;
        }
      }

      // Strategy 2: Find by orderNumber
      if (!updated && orderNumber) {
        const order = await db.order.findUnique({
          where: { orderNumber },
        });
        if (order) {
          await updateOrderStatus(db, order.id, order.orderNumber, status, transaction_id);
          updated = true;
        }
      }

      // Strategy 3: Try with the full description if nothing matched
      if (!updated && description && !orderNumber) {
        const allOrders = await db.order.findMany({
          where: { status: "pending" },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        for (const order of allOrders) {
          if (description.includes(order.orderNumber)) {
            await updateOrderStatus(db, order.id, order.orderNumber, status, transaction_id);
            updated = true;
            break;
          }
        }
      }

      if (!updated) {
        console.log(`[Webhook] ⚠️ No matching order found for this payment`);
      }
    } catch (dbError) {
      // Database errors are non-critical (DB may not exist on Vercel)
      console.warn(`[Webhook] ⚠️ DB update failed (non-critical):`, dbError);
    }

    // ── Always return 200 OK ────────────────────────────────
    return NextResponse.json({
      received: true,
      transaction_id: transaction_id || undefined,
      status,
      orderNumber: orderNumber || undefined,
    });
  } catch (error) {
    console.error("[Webhook] ❌ Unexpected error:", error);
    return NextResponse.json({
      received: true,
      error: "Processing failed but webhook was received",
    });
  }
}

// ── Helper: update order status ────────────────────────────
async function updateOrderStatus(
  db: Awaited<typeof import("@/lib/db")>["db"],
  orderId: string,
  orderNumber: string,
  status: string,
  transactionId: string,
) {
  const paidStatuses = ["paid", "completed", "succeeded", "confirmed", "approved", "gateway_confirmed", "settled"];
  const failedStatuses = ["failed", "cancelled", "expired", "declined", "rejected"];

  if (paidStatuses.includes(status)) {
    await db.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        paidAt: new Date(),
        ...(transactionId ? { nexflowxId: transactionId } : {}),
      },
    });
    console.log(`[Webhook] ✅ Order ${orderNumber} marked as PAID`);
  } else if (failedStatuses.includes(status)) {
    await db.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });
    console.log(`[Webhook] ❌ Order ${orderNumber} marked as CANCELLED`);
  } else if (status === "pending" || status === "processing" || status === "waiting") {
    await db.order.update({
      where: { id: orderId },
      data: { status: "processing" },
    });
    console.log(`[Webhook] ⏳ Order ${orderNumber} marked as PROCESSING`);
  } else {
    console.log(`[Webhook] ⚠️ Unknown status "${status}" for order ${orderNumber}`);
  }
}

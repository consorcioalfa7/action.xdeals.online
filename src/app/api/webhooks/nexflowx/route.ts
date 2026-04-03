import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── POST /api/webhooks/nexflowx ──────────────────────────────
// Recebe confirmações de pagamento da NeXFlowX.
// Por agora faz log do transaction_id e status recebidos no body.
// ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Log completo do body recebido para debugging
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    console.log("══════════════════════════════════════════════════");
    console.log("[NeXFlowX Webhook] Recebido notificação de pagamento");
    console.log("[NeXFlowX Webhook] Body completo:", JSON.stringify(body, null, 2));
    console.log("══════════════════════════════════════════════════");

    // Extrair campos esperados da NeXFlowX
    // A NeXFlowX envia: { id, status, amount, currency, metadata?, ... }
    const transaction_id = body.id || body.transaction_id || body.nexflowxId || "N/A";
    const status = body.status || "unknown";
    const amount = body.amount;
    const currency = body.currency;
    const orderRef = body.description || body.orderNumber || body.reference || "";

    // Log dos campos principais conforme requisito
    console.log(`[NeXFlowX Webhook] transaction_id: ${transaction_id}`);
    console.log(`[NeXFlowX Webhook] status: ${status}`);
    if (amount) console.log(`[NeXFlowX Webhook] amount: ${amount} ${currency || ""}`);
    if (orderRef) console.log(`[NeXFlowX Webhook] order reference: ${orderRef}`);

    // Tentar encontrar o pedido pelo nexflowxId para atualizar status
    if (transaction_id && transaction_id !== "N/A") {
      const order = await db.order.findFirst({
        where: { nexflowxId: transaction_id },
      });

      if (order) {
        if (status === "paid" || status === "completed" || status === "gateway_confirmed" || status === "succeeded") {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: "paid",
              paidAt: new Date(),
            },
          });
          console.log(`[NeXFlowX Webhook] ✅ Pedido ${order.orderNumber} marcado como PAGO`);
        } else if (status === "failed" || status === "cancelled" || status === "expired") {
          await db.order.update({
            where: { id: order.id },
            data: { status: "cancelled" },
          });
          console.log(`[NeXFlowX Webhook] ❌ Pedido ${order.orderNumber} marcado como CANCELADO`);
        } else {
          console.log(`[NeXFlowX Webhook] ⚠️ Status desconhecido "${status}" para pedido ${order.orderNumber}`);
        }
      } else {
        console.log(`[NeXFlowX Webhook] ⚠️ Nenhum pedido encontrado com nexflowxId: ${transaction_id}`);
      }
    }

    // Tentar também encontrar pelo orderNumber
    if (orderRef && !body.id) {
      const order = await db.order.findUnique({
        where: { orderNumber: orderRef },
      });
      if (order) {
        if (status === "paid" || status === "completed" || status === "gateway_confirmed") {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: "paid",
              paidAt: new Date(),
              nexflowxId: transaction_id !== "N/A" ? transaction_id : order.nexflowxId,
            },
          });
          console.log(`[NeXFlowX Webhook] ✅ Pedido ${order.orderNumber} marcado como PAGO (via orderNumber)`);
        }
      }
    }

    // Sempre retornar 200 OK para confirmar receção do webhook
    return NextResponse.json({
      received: true,
      transaction_id,
      status,
    });
  } catch (error) {
    console.error("[NeXFlowX Webhook] ❌ Erro ao processar webhook:", error);
    // Mesmo com erro, retornar 200 para evitar reenvios
    return NextResponse.json({
      received: true,
      error: "Processing failed but webhook was received",
    });
  }
}

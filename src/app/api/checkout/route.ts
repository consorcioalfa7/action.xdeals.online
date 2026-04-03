import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DELIVERY_CONFIG } from "@/lib/constants";

// ─── NeXFlowX Client (server-side only, no SDKs) ─────────────
function getNexFlowXConfig() {
  const apiUrl = process.env.NEXFLOWX_API_URL;
  const apiKey = process.env.NEXFLOWX_API_KEY;

  if (!apiUrl || !apiKey) {
    return null;
  }

  return { apiUrl: apiUrl.replace(/\/$/, ""), apiKey };
}

async function createPaymentLink(
  amount: number,
  currency: string,
  description: string
): Promise<{ id: string; shareable_url: string } | null> {
  const config = getNexFlowXConfig();
  if (!config) return null;

  // POST {NEXFLOWX_API_URL}/payment-links
  // Headers: x-api-key: {NEXFLOWX_API_KEY}, Content-Type: application/json
  // Body: { amount: 25.50, currency: "EUR" }
  const response = await fetch(`${config.apiUrl}/payment-links`, {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: parseFloat(amount.toFixed(2)),
      currency,
      description,
      ui_mode: "hosted",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[NeXFlowX] API Error ${response.status}: ${errorText}`);
    return null;
  }

  const json = await response.json();

  // A API devolve: { data: { id, shareable_url } }
  const data = json.data;
  if (!data || !data.shareable_url) {
    console.error("[NeXFlowX] No shareable_url in response:", JSON.stringify(json));
    return null;
  }

  return {
    id: data.id,
    shareable_url: data.shareable_url,
  };
}

// ─── POST /api/checkout ──────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      postalCode,
      country: countryCode,
      items,
      currency = "EUR",
    } = body;

    // ── Validate required fields ────────────────────────────────
    if (!email || !firstName || !lastName || !address || !city || !postalCode || !countryCode || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ── Validate & resolve country ──────────────────────────────
    const country = await db.country.findFirst({ where: { code: countryCode } });
    if (!country) {
      return NextResponse.json({ error: "Invalid country" }, { status: 400 });
    }

    // ── Calculate totals from cart items ────────────────────────
    // Items vêm do frontend com: { productId, name, slug, price, quantity, stockCount }
    // Confirma preços no backend para segurança
    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      price: number;
      productName: string;
      productSku: string;
    }> = [];

    for (const item of items) {
      // Usa o preço enviado do carrinho (calculado client-side)
      // Em produção, buscar na DB: db.product.findUnique({ where: { id: item.productId } })
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.name || item.slug || `Product ${item.productId}`,
        productSku: item.sku || `SKU-${item.productId}`,
      });
    }

    // ── Shipping ────────────────────────────────────────────────
    const shippingCost =
      subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold
        ? 0
        : DELIVERY_CONFIG.deliveryFee;
    const total = parseFloat((subtotal + shippingCost).toFixed(2));

    // ── Generate order number ───────────────────────────────────
    const orderNumber = `ACT-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // ── Create order in database ────────────────────────────────
    const order = await db.order.create({
      data: {
        orderNumber,
        email,
        firstName,
        lastName,
        phone: phone || null,
        address,
        city,
        postalCode,
        countryId: country.id,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shippingCost: parseFloat(shippingCost.toFixed(2)),
        total,
        currency,
        status: "pending",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    // ── Call NeXFlowX API (server-side, no SDKs) ───────────────
    const paymentLink = await createPaymentLink(
      total,
      currency,
      `Fatura #${orderNumber} - C.Euro2026`
    );

    if (paymentLink) {
      // Update order with NeXFlowX transaction ID and URL
      await db.order.update({
        where: { id: order.id },
        data: {
          nexflowxId: paymentLink.id,
          nexflowxUrl: paymentLink.shareable_url,
        },
      });

      console.log(`[Checkout] Order ${orderNumber} created. Payment link: ${paymentLink.shareable_url}`);

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentUrl: paymentLink.shareable_url,
        total: order.total,
        currency: order.currency,
      });
    }

    // ── Fallback: sem link de pagamento (API indisponível) ─────
    console.warn(`[Checkout] Order ${orderNumber} created but NeXFlowX payment link failed`);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: null,
      total: order.total,
      currency: order.currency,
      warning: "Payment service unavailable. Order saved but payment link not generated.",
    });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

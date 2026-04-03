import { NextRequest, NextResponse } from "next/server";
import { COUNTRIES, DELIVERY_CONFIG } from "@/lib/constants";

// ─── NeXFlowX Client (server-side only, no SDKs) ─────────────
function getNexFlowXConfig() {
  const apiUrl = process.env.NEXFLOWX_API_URL;
  const apiKey = process.env.NEXFLOWX_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error("[Checkout] NEXFLOWX_API_URL or NEXFLOWX_API_KEY not set in .env");
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

  console.log(`[Checkout] Creating payment link: ${amount} ${currency} — ${description}`);

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

  console.log(`[NeXFlowX] Payment link created: ${data.shareable_url}`);

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

    // ── Validate country (use in-memory COUNTRIES, no DB dependency) ──
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (!country) {
      return NextResponse.json(
        { error: `Invalid country: ${countryCode}. Supported: ${COUNTRIES.map(c => c.code).join(", ")}` },
        { status: 400 }
      );
    }

    // ── Calculate totals from cart items ────────────────────────
    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      price: number;
      productName: string;
      productSku: string;
    }> = [];

    for (const item of items) {
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

    // ── Try to save order to database (non-blocking) ───────────
    // Note: On Vercel, SQLite won't work (read-only filesystem).
    // The payment link is created regardless of DB save success.
    try {
      const { db } = await import("@/lib/db");
      await db.order.create({
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
      });
      console.log(`[Checkout] Order ${orderNumber} saved to database`);
    } catch (dbError) {
      console.warn(`[Checkout] Could not save order to database (non-critical):`, dbError);
      // Continue without DB save — payment link will still work
    }

    // ── Call NeXFlowX API (server-side) ────────────────────────
    const paymentLink = await createPaymentLink(
      total,
      currency,
      `Fatura #${orderNumber} - C.Euro2026`
    );

    if (paymentLink) {
      // Try to update order with nexflowx ID (non-critical)
      try {
        const { db } = await import("@/lib/db");
        await db.order.updateMany({
          where: { orderNumber },
          data: {
            nexflowxId: paymentLink.id,
            nexflowxUrl: paymentLink.shareable_url,
          },
        });
      } catch {
        // Non-critical
      }

      return NextResponse.json({
        success: true,
        orderNumber,
        paymentUrl: paymentLink.shareable_url,
        total,
        currency,
      });
    }

    // ── Fallback: no payment link ───────────────────────────────
    console.warn(`[Checkout] Order ${orderNumber} created but NeXFlowX payment link failed`);

    return NextResponse.json({
      success: true,
      orderNumber,
      paymentUrl: null,
      total,
      currency,
      warning: "Payment service unavailable. Order saved but payment link not generated.",
    });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}

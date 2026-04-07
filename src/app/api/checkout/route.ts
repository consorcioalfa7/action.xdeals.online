import { NextRequest, NextResponse } from "next/server";
import { COUNTRIES, DELIVERY_CONFIG } from "@/lib/constants";

// ─── NeXFlowX Client (server-side only, no SDKs) ─────────────
function getNexFlowXConfig() {
  const apiUrl = process.env.NEXFLOWX_API_URL || "https://api.nexflowx.tech/api/v1";
  const apiKey = process.env.NEXFLOWX_API_KEY || "nx_live_sua_chave_aqui";

  return { apiUrl: apiUrl.replace(/\/$/, ""), apiKey };
}

async function createPaymentLink(
  amount: number,
  currency: string,
  customerEmail: string,
  checkoutMode: "express" | "multi",
  metadata: any
): Promise<{ id: string; shareable_url: string } | null> {
  const config = getNexFlowXConfig();
  if (!config) return null;

  console.log(`[Checkout] Creating ${checkoutMode} payment link: ${amount} ${currency}`);

  try {
    const response = await fetch(`${config.apiUrl}/payment-links`, {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parseFloat(amount.toFixed(2)),
        currency,
        checkout_mode: checkoutMode,
        country: metadata.country_code || "PT",
        customer_email: customerEmail,
        metadata: {
          ...metadata,
          platform: "Manus Agent",
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[NeXFlowX] API Error ${response.status}: ${errorText}`);
      return null;
    }

    const json = await response.json();
    const data = json.data;
    
    if (!data || !data.shareable_url) {
      console.error("[NeXFlowX] No shareable_url in response:", JSON.stringify(json));
      return null;
    }

    return {
      id: data.id,
      shareable_url: data.shareable_url,
    };
  } catch (error) {
    console.error("[NeXFlowX] Request failed:", error);
    return null;
  }
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
      checkoutMode = "multi", // default to multi if not specified
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const country = countryCode
      ? COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0]
      : COUNTRIES[0];

    let subtotal = 0;
    const itemsDescription: string[] = [];

    for (const item of items) {
      subtotal += item.price * item.quantity;
      itemsDescription.push(`${item.quantity}x ${item.name || item.slug}`);
    }

    const shippingCost = subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold ? 0 : DELIVERY_CONFIG.deliveryFee;
    const total = parseFloat((subtotal + shippingCost).toFixed(2));

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Prepare metadata for NeXFlowX
    const metadata = {
      order_id: orderNumber,
      customer_name: `${firstName} ${lastName}`.trim(),
      shipping_address: `${address}, ${city}, ${postalCode}, ${country.name}`,
      items: itemsDescription.join(", "),
      country_code: country.code,
    };

    // Call NeXFlowX API
    const paymentLink = await createPaymentLink(
      total,
      currency,
      email || "guest@example.com",
      checkoutMode,
      metadata
    );

    if (paymentLink) {
      return NextResponse.json({
        success: true,
        orderNumber,
        paymentUrl: paymentLink.shareable_url,
        total,
        currency,
        checkoutMode,
      });
    }

    return NextResponse.json({
      success: false,
      error: "Não foi possível gerar o link de pagamento. Por favor, tente novamente.",
    }, { status: 500 });

  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o checkout" },
      { status: 500 }
    );
  }
}

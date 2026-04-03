import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DELIVERY_CONFIG } from "@/lib/constants";

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

    // Validate required fields
    if (!email || !firstName || !lastName || !address || !city || !postalCode || !countryCode || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Find country
    const country = await db.country.findFirst({
      where: { code: countryCode },
    });

    if (!country) {
      return NextResponse.json(
        { error: "Invalid country" },
        { status: 400 }
      );
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      price: number;
      productName: string;
      productSku: string;
    }> = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stockCount < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.slug}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      // Get product name from translation
      const translation = await db.productTranslation.findFirst({
        where: {
          productId: product.id,
          countryId: country.id,
        },
      });

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        productName: translation?.name || product.slug,
        productSku: product.sku,
      });
    }

    // Calculate shipping
    const shippingCost = subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold ? 0 : DELIVERY_CONFIG.deliveryFee;
    const total = subtotal + shippingCost;

    // Generate order number
    const orderNumber = `ACT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create order in database
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
        subtotal,
        shippingCost,
        total,
        currency,
        status: "pending",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // Attempt to create NeXFlowX payment link
    const nexflowxApiKey = process.env.NEXFLOWX_API_KEY;

    if (nexflowxApiKey) {
      try {
        const paymentResponse = await fetch(
          "https://api.nexflowx.tech/api/v1/payment-links",
          {
            method: "POST",
            headers: {
              "x-api-key": nexflowxApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: total,
              currency,
              description: `Order #${orderNumber}`,
            }),
          }
        );

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();

          // Update order with payment link info
          await db.order.update({
            where: { id: order.id },
            data: {
              nexflowxId: paymentData.id || paymentData.payment_link_id || null,
              nexflowxUrl: paymentData.shareable_url || paymentData.url || null,
            },
          });

          return NextResponse.json({
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentUrl: paymentData.shareable_url || paymentData.url,
            total: order.total,
            currency: order.currency,
          });
        }
      } catch (paymentError) {
        console.error("NeXFlowX payment link creation failed:", paymentError);
        // Continue without payment link - order is still created
      }
    }

    // Return order without payment link
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: null,
      total: order.total,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

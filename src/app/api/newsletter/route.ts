import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { COUNTRIES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, country: countryCode } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing subscription
    const existing = await db.newsletter.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "Email already subscribed" },
          { status: 409 }
        );
      }

      // Reactivate subscription
      await db.newsletter.update({
        where: { email: normalizedEmail },
        data: { isActive: true },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription reactivated",
      });
    }

    // Find country if provided
    let countryId: string | undefined;
    if (countryCode) {
      const country = COUNTRIES.find((c) => c.code === countryCode);
      if (country) {
        const dbCountry = await db.country.findFirst({
          where: { code: countryCode },
        });
        if (dbCountry) countryId = dbCountry.id;
      }
    }

    // Create newsletter subscription
    await db.newsletter.create({
      data: {
        email: normalizedEmail,
        countryId: countryId || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);

    // Handle unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email already subscribed" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_BANNERS } from "@/lib/mock-data";
import { COUNTRIES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position") || "home";
    const countryParam = searchParams.get("country") || "PT";

    const country = COUNTRIES.find((c) => c.code === countryParam) || COUNTRIES[0];

    // Check database
    const dbBannerCount = await db.banner.count();

    if (dbBannerCount === 0) {
      // Return mock banners
      const banners = MOCK_BANNERS.filter((b) => {
        if (position && position !== "home") return false;
        return true;
      }).map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        link: b.linkSlug ? `category/${b.linkSlug}` : b.link,
        position: "home",
        gradient: (b as Record<string, unknown>).gradient,
        ctaText: b.ctaText[country.locale] || b.ctaText["pt-PT"],
      }));

      return NextResponse.json({ banners });
    }

    // Get banners from database
    const where: Record<string, unknown> = {
      isActive: true,
      position,
    };

    if (countryParam) {
      const countryRecord = await db.country.findFirst({
        where: { code: countryParam },
      });

      if (countryRecord) {
        where.OR = [
          { countryId: countryRecord.id },
          { countryId: null },
        ];
      } else {
        where.countryId = null;
      }
    }

    const now = new Date();
    const banners = await db.banner.findMany({
      where: {
        ...where,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

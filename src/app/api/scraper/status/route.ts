import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");

    const where: Record<string, unknown> = {};

    if (countryId) {
      where.countryId = countryId;
    }

    const logs = await db.scraperLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        country: {
          select: {
            code: true,
            name: true,
            flag: true,
          },
        },
      },
    });

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        url: log.url,
        status: log.status,
        productsFound: log.productsFound,
        error: log.error,
        durationMs: log.durationMs,
        createdAt: log.createdAt,
        country: log.country,
      })),
      total: logs.length,
    });
  } catch (error) {
    console.error("Error fetching scraper logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch scraper logs" },
      { status: 500 }
    );
  }
}

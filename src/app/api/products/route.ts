import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES_MAP } from "@/lib/mock-data";
import { COUNTRIES } from "@/lib/constants";

// Basic in-memory rate limiter (per IP)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests per minute
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured") === "true";
    const onSale = searchParams.get("onSale") === "true";
    const newProducts = searchParams.get("new") === "true";
    const countryParam = searchParams.get("country") || "PT";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Find locale for country
    const country = COUNTRIES.find((c) => c.code === countryParam) || COUNTRIES[0];
    const locale = country.locale;

    // Check if database has products
    const dbProductCount = await db.product.count();

    if (dbProductCount === 0) {
      // Return mock data with filtering
      let filtered = [...MOCK_PRODUCTS];

      if (category) {
        const productIds = PRODUCT_CATEGORIES_MAP[category] || [];
        filtered = filtered.filter((p) => productIds.includes(p.id));
      }

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter((p) => {
          const translation = p.translations[locale] || p.translations["pt-PT"];
          return (
            translation.name.toLowerCase().includes(query) ||
            translation.description?.toLowerCase().includes(query) ||
            p.slug.toLowerCase().includes(query)
          );
        });
      }

      if (featured) filtered = filtered.filter((p) => p.isFeatured);
      if (onSale) filtered = filtered.filter((p) => p.isOnSale);
      if (newProducts) filtered = filtered.filter((p) => p.isNew);

      const total = filtered.length;
      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);

      return NextResponse.json({
        products: paged,
        total,
        page,
        limit,
      });
    }

    // Build Prisma query with filters
    const where: Record<string, unknown> = { isActive: true };

    if (featured) where.isFeatured = true;
    if (onSale) where.isOnSale = true;
    if (newProducts) where.isNew = true;

    if (search) {
      const countryRecord = await db.country.findFirst({
        where: { code: countryParam },
      });

      if (countryRecord) {
        where.OR = [
          {
            translations: {
              some: {
                countryId: countryRecord.id,
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          },
          {
            slug: { contains: search, mode: "insensitive" as const },
          },
          {
            sku: { contains: search, mode: "insensitive" as const },
          },
        ];
      } else {
        where.OR = [
          { slug: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
        ];
      }
    }

    if (category) {
      const countryRecord = await db.country.findFirst({
        where: { code: countryParam },
      });
      if (countryRecord) {
        where.categories = {
          some: {
            category: { slug: category },
            countryId: countryRecord.id,
          },
        };
      } else {
        where.categories = {
          some: {
            category: { slug: category },
          },
        };
      }
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          translations: {
            where: { country: { code: countryParam } },
            take: 1,
          },
        },
        orderBy: { sortOrder: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Format products
    const formattedProducts = products.map((product) => {
      const translation = product.translations[0];
      return {
        id: product.id,
        slug: product.slug,
        sku: product.sku,
        ean: product.ean,
        price: product.price,
        originalPrice: product.originalPrice,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        stockCount: product.stockCount,
        images: JSON.parse(product.images || "[]"),
        attributes: product.attributes ? JSON.parse(product.attributes) : [],
        name: translation?.name || product.slug,
        description: translation?.description,
        shortDesc: translation?.shortDesc,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

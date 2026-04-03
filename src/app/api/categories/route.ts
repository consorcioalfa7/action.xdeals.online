import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CATEGORIES, COUNTRIES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryParam = searchParams.get("country") || "PT";

    const country = COUNTRIES.find((c) => c.code === countryParam) || COUNTRIES[0];
    const locale = country.locale;

    // Check if database has categories
    const dbCategoryCount = await db.category.count();

    if (dbCategoryCount === 0) {
      // Return categories from constants with mock product counts
      const categories = CATEGORIES.map((cat) => ({
        id: cat.slug,
        slug: cat.slug,
        icon: cat.icon,
        name: cat.label[locale] || cat.label["pt-PT"],
        sortOrder: CATEGORIES.indexOf(cat),
        parentId: null,
        productCount: 0,
        children: cat.children.map((child, idx) => ({
          id: child.slug,
          slug: child.slug,
          icon: child.icon,
          name: child.label[locale] || child.label["pt-PT"],
          sortOrder: idx,
          parentId: cat.slug,
          productCount: 0,
          children: [],
        })),
      }));

      return NextResponse.json({ categories });
    }

    // Get categories from database with product counts
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            countryLinks: {
              where: { country: { code: countryParam } },
              select: { productId: true },
            },
          },
        },
        countryLinks: {
          where: { country: { code: countryParam } },
          select: { productId: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      parentId: null,
      productCount: new Set(cat.countryLinks.map((l) => l.productId)).size,
      children: cat.children.map((child) => ({
        id: child.id,
        slug: child.slug,
        icon: child.icon,
        sortOrder: child.sortOrder,
        parentId: child.parentId,
        productCount: new Set(
          child.countryLinks.map((l) => l.productId)
        ).size,
      })),
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES_MAP } from "@/lib/mock-data";
import { COUNTRIES } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const countryParam = searchParams.get("country") || "PT";

    const country = COUNTRIES.find((c) => c.code === countryParam) || COUNTRIES[0];
    const locale = country.locale;

    // Check database first
    const dbProductCount = await db.product.count();

    if (dbProductCount > 0) {
      const product = await db.product.findUnique({
        where: { slug },
        include: {
          translations: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      if (product) {
        const translation = product.translations.find(
          (t) => t.country.code === countryParam
        ) || product.translations[0];

        // Get related products (same category)
        const categoryIds = product.categories.map((c) => c.categoryId);
        const relatedProducts = categoryIds.length > 0
          ? await db.product.findMany({
              where: {
                id: { not: product.id },
                categories: { some: { categoryId: { in: categoryIds } } },
                isActive: true,
              },
              include: {
                translations: {
                  where: { country: { code: countryParam } },
                  take: 1,
                },
              },
              take: 8,
            })
          : [];

        return NextResponse.json({
          product: {
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
            metaTitle: translation?.metaTitle,
            metaDesc: translation?.metaDesc,
            categories: product.categories.map((c) => c.category.slug),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          },
          relatedProducts: relatedProducts.map((rp) => ({
            id: rp.id,
            slug: rp.slug,
            sku: rp.sku,
            price: rp.price,
            originalPrice: rp.originalPrice,
            isOnSale: rp.isOnSale,
            isNew: rp.isNew,
            stockCount: rp.stockCount,
            images: JSON.parse(rp.images || "[]"),
            name: rp.translations[0]?.name || rp.slug,
            shortDesc: rp.translations[0]?.shortDesc,
          })),
        });
      }
    }

    // Fallback to mock data
    const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);

    if (!mockProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const translation = mockProduct.translations[locale] || mockProduct.translations["pt-PT"];

    // Find related products from mock data
    const productCategory = Object.entries(PRODUCT_CATEGORIES_MAP).find(([, ids]) =>
      ids.includes(mockProduct.id)
    );
    const relatedProductIds = productCategory
      ? PRODUCT_CATEGORIES_MAP[productCategory[0]].filter((id) => id !== mockProduct.id).slice(0, 8)
      : [];

    const relatedProducts = relatedProductIds
      .map((id) => MOCK_PRODUCTS.find((p) => p.id === id))
      .filter(Boolean)
      .map((rp) => {
        const rpTranslation = rp!.translations[locale] || rp!.translations["pt-PT"];
        return {
          id: rp!.id,
          slug: rp!.slug,
          sku: rp!.sku,
          price: rp!.price,
          originalPrice: rp!.originalPrice,
          isOnSale: rp!.isOnSale,
          isNew: rp!.isNew,
          stockCount: rp!.stockCount,
          images: rp!.images,
          name: rpTranslation.name,
          shortDesc: rpTranslation.shortDesc,
        };
      });

    return NextResponse.json({
      product: {
        ...mockProduct,
        name: translation.name,
        description: translation.description,
        shortDesc: translation.shortDesc,
        categories: productCategory ? [productCategory[0]] : [],
      },
      relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

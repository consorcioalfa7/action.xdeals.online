import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES_MAP } from "@/lib/mock-data";
import { COUNTRIES } from "@/lib/constants";

export async function POST() {
  try {
    // Check if database is already seeded
    const existingProducts = await db.product.count();
    if (existingProducts > 0) {
      return NextResponse.json({
        seeded: false,
        message: "Database already has data",
        counts: {
          countries: await db.country.count(),
          categories: await db.category.count(),
          products: existingProducts,
          translations: await db.productTranslation.count(),
          banners: await db.banner.count(),
        },
      });
    }

    const counts = { countries: 0, categories: 0, products: 0, translations: 0, banners: 0 };

    // Seed countries
    for (const country of COUNTRIES) {
      await db.country.upsert({
        where: { code: country.code },
        update: {},
        create: {
          code: country.code,
          locale: country.locale,
          name: country.name,
          flag: country.flag,
          currency: country.currency,
          domain: country.domain,
          isActive: country.isActive,
        },
      });
      counts.countries++;
    }

    // Seed categories
    const { CATEGORIES } = await import("@/lib/constants");
    const categoryMap = new Map<string, string>(); // slug -> id

    for (const parentCat of CATEGORIES) {
      const parent = await db.category.upsert({
        where: { slug: parentCat.slug },
        update: {},
        create: {
          slug: parentCat.slug,
          icon: parentCat.icon,
          sortOrder: CATEGORIES.indexOf(parentCat),
        },
      });
      categoryMap.set(parentCat.slug, parent.id);
      counts.categories++;

      for (const childCat of parentCat.children) {
        const child = await db.category.upsert({
          where: { slug: childCat.slug },
          update: {},
          create: {
            slug: childCat.slug,
            icon: childCat.icon,
            sortOrder: parentCat.children.indexOf(childCat),
            parentId: parent.id,
          },
        });
        categoryMap.set(childCat.slug, child.id);
        counts.categories++;
      }
    }

    // Seed products and translations
    for (const product of MOCK_PRODUCTS) {
      const dbProduct = await db.product.create({
        data: {
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
          images: JSON.stringify(product.images),
          attributes: product.attributes ? JSON.stringify(product.attributes) : null,
        },
      });
      counts.products++;

      // Create translations for each country
      for (const country of COUNTRIES) {
        const translation = product.translations[country.locale] || product.translations["pt-PT"];
        if (translation) {
          const dbCountry = await db.country.findFirst({
            where: { code: country.code },
          });
          if (dbCountry) {
            await db.productTranslation.create({
              data: {
                productId: dbProduct.id,
                countryId: dbCountry.id,
                name: translation.name,
                description: translation.description || null,
                shortDesc: translation.shortDesc || null,
              },
            });
            counts.translations++;
          }
        }
      }

      // Link product to categories
      for (const [catSlug] of Object.entries(PRODUCT_CATEGORIES_MAP)) {
        if (PRODUCT_CATEGORIES_MAP[catSlug].includes(product.id)) {
          // Check both parent and child categories
          let categoryId = categoryMap.get(catSlug);
          if (!categoryId) {
            // Try hyphenated version (e.g., casa-decoracao)
            categoryId = categoryMap.get(catSlug);
          }
          if (categoryId) {
            // Link to the country
            for (const country of COUNTRIES) {
              const dbCountry = await db.country.findFirst({
                where: { code: country.code },
              });
              if (dbCountry) {
                await db.categoryProductCountry.upsert({
                  where: {
                    categoryId_productId_countryId: {
                      categoryId,
                      productId: dbProduct.id,
                      countryId: dbCountry.id,
                    },
                  },
                  update: {},
                  create: {
                    categoryId,
                    productId: dbProduct.id,
                    countryId: dbCountry.id,
                  },
                });
              }
            }
          }
        }
      }
    }

    // Seed banners
    const { MOCK_BANNERS } = await import("@/lib/mock-data");
    const ptCountry = await db.country.findFirst({ where: { code: "PT" } });

    for (const banner of MOCK_BANNERS) {
      if (ptCountry) {
        await db.banner.create({
          data: {
            title: banner.title,
            subtitle: banner.subtitle,
            image: banner.image,
            link: banner.link,
            position: "home",
            countryId: ptCountry.id,
            isActive: true,
            sortOrder: parseInt(banner.id.replace("banner-", ""), 10) - 1,
          },
        });
        counts.banners++;
      }
    }

    return NextResponse.json({
      seeded: true,
      message: "Database seeded successfully",
      counts,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}

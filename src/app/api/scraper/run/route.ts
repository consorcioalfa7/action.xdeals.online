import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryId, url } = body;

    if (!countryId || !url) {
      return NextResponse.json(
        { error: "countryId and url are required" },
        { status: 400 }
      );
    }

    // Validate country exists
    const country = await db.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let productsFound = 0;
    let logError: string | undefined;
    let status = "success";

    try {
      // Use z-ai-web-dev-sdk to fetch page content
      const zai = await ZAI.create();
      const result = await zai.functions.invoke("page_reader", {
        url,
      });

      const htmlContent = result as string;

      if (!htmlContent || typeof htmlContent !== "string") {
        throw new Error("Failed to fetch page content");
      }

      // Basic product parsing from HTML
      // This is a simple parser - in production, you'd use a proper scraper
      const products: Array<{
        slug: string;
        sku: string;
        name: string;
        price: number;
        images: string;
      }> = [];

      // Look for common e-commerce product patterns
      const productPatterns = [
        // Common product card patterns
        /<article[^>]*class="[^"]*(?:product|item|card)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
        /<div[^>]*class="[^"]*(?:product|item|card)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      ];

      const pricePattern = /(?:price|valor|preço|preis|prix|precio)[^0-9]*([0-9]+[.,][0-9]{2})/gi;
      const imagePattern = /<img[^>]+src="([^"]+)"/gi;
      const titlePattern = /<h[1-4][^>]*>([^<]+)<\/h[1-4]>/gi;

      // Simple extraction approach
      let match;
      const titles: string[] = [];
      const prices: number[] = [];
      const images: string[] = [];

      while ((match = titlePattern.exec(htmlContent)) !== null && titles.length < 50) {
        const title = match[1].trim();
        if (title.length > 3 && title.length < 200) {
          titles.push(title);
        }
      }

      while ((match = pricePattern.exec(htmlContent)) !== null && prices.length < 50) {
        const price = parseFloat(match[1].replace(",", "."));
        if (price > 0 && price < 10000) {
          prices.push(price);
        }
      }

      while ((match = imagePattern.exec(htmlContent)) !== null && images.length < 50) {
        if (match[1].startsWith("http") && match[1].includes("product")) {
          images.push(match[1]);
        }
      }

      // Create product entries
      const maxProducts = Math.min(titles.length, prices.length, 30);
      for (let i = 0; i < maxProducts; i++) {
        const slug = titles[i]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 100);

        if (slug.length < 3) continue;

        try {
          await db.product.create({
            data: {
              slug: `${slug}-${Date.now()}-${i}`,
              sku: `SCR-${country.code}-${Date.now()}-${i}`,
              price: prices[i],
              isActive: true,
              isFeatured: false,
              isNew: true,
              stockCount: 50,
              images: JSON.stringify(images[i] ? [{ url: images[i], alt: titles[i] }] : []),
              attributes: null,
            },
          });
          productsFound++;
        } catch {
          // Skip duplicate or invalid products
        }
      }
    } catch (scrapeError) {
      status = "error";
      logError = scrapeError instanceof Error ? scrapeError.message : "Unknown error";
      console.error("Scraping error:", scrapeError);
    }

    const durationMs = Date.now() - startTime;

    // Log the scrape result
    await db.scraperLog.create({
      data: {
        countryId,
        url,
        status,
        productsFound,
        error: logError,
        durationMs,
      },
    });

    return NextResponse.json({
      status,
      productsFound,
      durationMs,
      country: country.code,
    });
  } catch (error) {
    console.error("Error running scraper:", error);
    return NextResponse.json(
      { error: "Failed to run scraper" },
      { status: 500 }
    );
  }
}

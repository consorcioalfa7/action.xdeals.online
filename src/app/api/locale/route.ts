import { NextRequest, NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/constants";
import type { Country } from "@/lib/types";

// European country code to our country mapping
const EU_IP_COUNTRY_MAP: Record<string, string> = {
  PT: "PT",
  FR: "FR",
  ES: "ES",
  IT: "IT",
  NL: "NL",
  DE: "DE",
  BE: "BE",
  LU: "LU",
  AT: "DE", // Austria -> Germany (nearest)
  CH: "DE", // Switzerland -> Germany
};

// Brazilian IP ranges (basic check)
const BR_HEADER_HINTS = ["br", "brazil", "brasil"];

export async function GET(request: NextRequest) {
  try {
    // Get IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfIpCountry = request.headers.get("cf-ipcountry"); // Cloudflare header

    // Check Cloudflare country header first
    if (cfIpCountry) {
      const countryCode = cfIpCountry.toUpperCase();

      // Check if Brazilian
      if (countryCode === "BR") {
        const brCountry = COUNTRIES.find((c) => c.code === "BR") as Country;
        return NextResponse.json({ country: brCountry });
      }

      // Check if European
      const mappedCode = EU_IP_COUNTRY_MAP[countryCode];
      if (mappedCode) {
        const country = COUNTRIES.find((c) => c.code === mappedCode) as Country;
        return NextResponse.json({ country });
      }
    }

    // Try to determine from IP
    const clientIp = realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : "");

    // Default to Portugal
    const defaultCountry = COUNTRIES.find((c) => c.code === "PT") as Country;

    if (!clientIp) {
      return NextResponse.json({ country: defaultCountry });
    }

    // Check accept-language header for hints
    const acceptLanguage = request.headers.get("accept-language") || "";
    const langLower = acceptLanguage.toLowerCase();

    if (langLower.includes("pt-br") || langLower.includes("pt-brazil")) {
      const brCountry = COUNTRIES.find((c) => c.code === "BR") as Country;
      return NextResponse.json({ country: brCountry });
    }

    // Language-based country detection as fallback
    const langMap: Record<string, string> = {
      "fr-fr": "FR",
      "fr-be": "BE",
      "fr-lu": "LU",
      "es-es": "ES",
      "it-it": "IT",
      "nl-nl": "NL",
      "de-de": "DE",
      "de-at": "DE",
      "de-ch": "DE",
      "lb-lu": "LU",
      "pt-pt": "PT",
    };

    for (const [lang, code] of Object.entries(langMap)) {
      if (langLower.includes(lang)) {
        const country = COUNTRIES.find((c) => c.code === code) as Country;
        return NextResponse.json({ country });
      }
    }

    return NextResponse.json({ country: defaultCountry });
  } catch (error) {
    console.error("Error detecting locale:", error);
    const defaultCountry = COUNTRIES.find((c) => c.code === "PT") as Country;
    return NextResponse.json({ country: defaultCountry });
  }
}

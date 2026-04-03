import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Action | Os Melhores Preços em Tudo para a Sua Casa",
    template: "%s | Action",
  },
  description:
    "Action - A sua loja de descontos favorita. Milhares de produtos a preços incríveis: alimentação, bricolage, decoração, jardinagem, higiene, brinquedos e muito mais. Entregas ao domicílio gratuitas acima de 19,90€.",
  keywords: [
    "Action", "loja de descontos", "preços baixos", "compras online",
    "alimentação", "bricolage", "jardim", "casa", "decoração",
    "entregas ao domicílio", "descontos", "ofertas semanais",
    " Portugal", "França", "Espanha", "Itália", "Holanda", "Alemanha",
    "Brasil", "compras online", "promoções",
  ],
  authors: [{ name: "Action" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Action | Os Melhores Preços em Tudo para a Sua Casa",
    description:
      "Milhares de produtos a preços incríveis. Entregas ao domicílio gratuitas acima de 19,90€.",
    url: "https://action.xdeals.online",
    siteName: "Action",
    type: "website",
    locale: "pt_PT",
    alternateLocale: ["fr_FR", "es_ES", "it_IT", "nl_NL", "de_DE", "pt_BR"],
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Action - Os Melhores Preços",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Action | Os Melhores Preços",
    description: "Milhares de produtos a preços incríveis. Entregas grátis acima de 19,90€.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://action.xdeals.online",
    languages: {
      "pt-PT": "https://action.xdeals.online/pt-pt",
      "fr-FR": "https://action.xdeals.online/fr",
      "es-ES": "https://action.xdeals.online/es",
      "it-IT": "https://action.xdeals.online/it",
      "nl-NL": "https://action.xdeals.online/nl",
      "de-DE": "https://action.xdeals.online/de",
      "pt-BR": "https://action.xdeals.online/br",
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* NeXFlowX SDK for checkout */}
        <script src="https://api.nexflowx.tech/sdk.js" defer />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Action",
              url: "https://action.xdeals.online",
              logo: "https://action.xdeals.online/logo.svg",
              description:
                "Loja de descontos online com milhares de produtos a preços incríveis.",
              address: {
                "@type": "PostalAddress",
                addressCountry: ["PT", "FR", "ES", "IT", "NL", "DE", "BE", "LU", "BR"],
              },
              priceRange: "€",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ],
                opens: "08:00",
                closes: "20:00",
              },
              sameAs: [
                "https://www.facebook.com/actionstores",
                "https://www.instagram.com/actionstores",
                "https://www.youtube.com/actionstores",
                "https://www.linkedin.com/company/action-stores",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Action",
              url: "https://action.xdeals.online",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://action.xdeals.online/?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

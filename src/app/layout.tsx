import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meproducciones.com";

export const metadata: Metadata = {
  title: {
    default: "Mónica Espinoza Producciones — Experiencias que transforman",
    template: "%s | Mónica Espinoza Producciones",
  },
  description:
    "ME Producciones produce experiencias de clase mundial para la comunidad latina en Estados Unidos — con propósito, comunidad y transformación. Descubre The Real Happiness y más.",
  keywords: [
    "eventos latinos",
    "experiencias premium",
    "The Real Happiness",
    "ME Producciones",
    "eventos comunidad latina",
    "speakers latinos",
    "conferencias latinas",
    "wellness latino",
    "summit latino",
    "eventos transformacion",
  ],
  authors: [{ name: "ME Producciones", url: siteUrl }],
  creator: "ME Producciones",
  publisher: "ME Producciones",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ME Producciones — Experiencias que transforman",
    description:
      "Producimos experiencias de clase mundial para la comunidad latina — diseñadas con propósito, ejecutadas con precisión, y construidas para transformar vidas.",
    url: siteUrl,
    siteName: "ME Producciones",
    locale: "es_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ME Producciones — Experiencias que transforman",
    description:
      "Producimos experiencias de clase mundial para la comunidad latina.",
    creator: "@meproducciones",
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2A2421",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col antialiased bg-[#FDFAF7] text-[#2A2421]">
        {children}
      </body>
    </html>
  );
}

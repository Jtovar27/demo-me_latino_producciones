import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "ME Latino Producciones",
    template: "%s | ME Latino Producciones",
  },
  description:
    "Experiencias premium que transforman. ME Latino Producciones produce eventos con propósito, comunidad y transformación para la comunidad latina en Estados Unidos.",
  keywords: ["eventos latinos", "experiencias premium", "The Real Happiness", "ME Latino Producciones"],
  openGraph: {
    title: "ME Latino Producciones",
    description: "Experiencias premium que transforman.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-[#FDFAF7] text-[#2A2421]">
        {children}
      </body>
    </html>
  );
}

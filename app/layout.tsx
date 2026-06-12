import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { CartProvider } from "./context/CartContext";
import { AdminProvider } from "./context/AdminContext";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const siteUrl = 'https://ghdesign.vercel.app';

export const metadata: Metadata = {
  title: "GH Design — Tunisian Women's Fashion",
  description: "Handcrafted fashion for men & women, inspired by the soul of North Africa.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "GH Design — Tunisian Women's Fashion",
    description: "Handcrafted fashion for men & women, inspired by the soul of North Africa.",
    url: 'https://ghdesign.vercel.app',
    siteName: 'GH Design',
    images: [
      {
        url: 'https://ghdesign.vercel.app/api/og',
        width: 1200,
        height: 630,
        alt: 'GH Design — Tunisian Fashion',
      },
    ],
    locale: 'fr_TN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "GH Design — Tunisian Women's Fashion",
    description: "Handcrafted fashion for men & women, inspired by the soul of North Africa.",
    images: ['https://ghdesign.vercel.app/api/og'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${montserrat.variable} h-full`}>
      <head>
        <meta property="og:image" content="https://ghdesign.vercel.app/api/og" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GH Design" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AdminProvider><CartProvider>{children}</CartProvider></AdminProvider>
      </body>
    </html>
  );
}

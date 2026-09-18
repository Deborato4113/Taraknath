import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import { CartProvider } from "../components/CartContext";

// Falls back to localhost in dev; set NEXT_PUBLIC_SITE_URL to your real
// production domain (e.g. https://www.taraknathengineeringworks.com) once
// deployed — this is what lets Next.js turn relative image paths (like
// /Photos/...) into full absolute URLs for Open Graph / Twitter previews
// and for the sitemap below.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Taraknath Engineering Works",
    template: "%s — Taraknath Engineering Works",
  },
  description:
    "ISO 9001:2015 certified manufacturer of shipyard products, deck machinery, bronze items and white metal lining journal bearings. Supplying GRSE and major industrial customers across India.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    siteName: "Taraknath Engineering Works",
    type: "website",
    locale: "en_IN",
    images: ["/TEW-works.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/TEW-works.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><AuthProvider><CartProvider>{children}</CartProvider></AuthProvider></body>
    </html>
  );
}
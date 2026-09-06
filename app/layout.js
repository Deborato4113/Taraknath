import "./globals.css";

export const metadata = {
  title: "Taraknath Engineering Works",
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
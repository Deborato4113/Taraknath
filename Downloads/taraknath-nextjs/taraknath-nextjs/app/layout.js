import "./globals.css";

export const metadata = {
  title: "Taraknath Engineering Works",
  description:
    "ISO 9001:2015 certified manufacturer of shipyard products, deck machinery, bronze items and white metal lining journal bearings. Supplying GRSE and major industrial customers across India.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

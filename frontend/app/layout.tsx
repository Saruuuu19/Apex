import localFont from "next/font/local";
import "./globals.css";

const geist = localFont({
  src: "./fonts/Geist[wght].woff2",
  variable: "--font-geist",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono[wght].woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const geistPixel = localFont({
  src: "./fonts/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geist.variable} ${geistMono.variable} ${geistPixel.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
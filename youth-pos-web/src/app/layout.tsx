import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI POS",
  description: "Premium POS, member ordering, and pickup system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
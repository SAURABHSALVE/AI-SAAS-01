import type { Metadata } from "next";
// Ignore missing type declarations for CSS side-effect import
import "./globals.css";

export const metadata: Metadata = {
  title: "Meeting AI",
  description: "Meeting AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
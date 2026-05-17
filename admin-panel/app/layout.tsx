import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Girly Vibes Admin",
  description: "Private admin panel for Girly Vibes",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

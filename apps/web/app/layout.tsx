import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Weatherise · Weather Decisions for Da Nang",
    template: "%s · Weatherise",
  },
  description:
    "Weather-aware decisions for tourism, construction, and agriculture in Da Nang. Multi-agent pipeline on NVIDIA NIM.",
  applicationName: "Weatherise",
  // Simplified Weatherise mark (public/favicon.svg), rasterized for every surface.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  keywords: ["weather", "risk", "tourism", "construction", "agriculture", "Da Nang", "Vietnam", "AI", "NVIDIA"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

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
  // Cropped Weatherise logo, sized for tabs and home screens.
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
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

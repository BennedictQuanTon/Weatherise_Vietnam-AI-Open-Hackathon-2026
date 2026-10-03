import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Weatherise",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}

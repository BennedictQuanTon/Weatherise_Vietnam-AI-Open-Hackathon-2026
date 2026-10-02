import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline Monitor",
};

export default function MonitorLayout({ children }: { children: React.ReactNode }) {
  return children;
}

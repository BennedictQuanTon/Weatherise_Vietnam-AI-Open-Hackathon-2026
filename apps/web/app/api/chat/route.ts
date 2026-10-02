import { NextRequest, NextResponse } from "next/server";
import { routeMockQuery } from "../mockData";

export const dynamic = "force-dynamic";

// Demo mode is the default: every answer comes from the mock engine.
// Set USE_BACKEND=true (with API_URL) to forward to the FastAPI pipeline instead.
const USE_BACKEND = process.env.USE_BACKEND === "true";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message: string = body.message || "";

  const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (USE_BACKEND && backendUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const upstream = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (upstream.ok) return NextResponse.json(await upstream.json());
    } catch (err) {
      console.warn("Backend proxy failed, using demo data:", err);
    }
  }

  return NextResponse.json(routeMockQuery(message));
}

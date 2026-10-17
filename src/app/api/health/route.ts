import { NextResponse } from "next/server";
import { getContainer } from "@/composition-root/container";

// Never cache: an uptime monitor must see the live state.
export const dynamic = "force-dynamic";

export function GET() {
  const { clock } = getContainer();
  return NextResponse.json(
    { status: "ok", service: "deepsemantic", time: clock.now().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

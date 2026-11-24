import { NextResponse } from "next/server";

import { sanityConfig } from "@/lib/sanity/client";

export async function GET() {
  const configured = Boolean(
    sanityConfig.projectId && sanityConfig.projectId !== "your-project-id" && sanityConfig.dataset,
  );

  return NextResponse.json({
    status: configured ? "configured" : "not-configured",
    apiVersion: sanityConfig.apiVersion,
  });
}

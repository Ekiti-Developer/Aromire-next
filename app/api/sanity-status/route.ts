import { NextResponse } from "next/server";
import { sanityConfig } from "@/lib/sanity";

export async function GET() {
  const isConfigured = sanityConfig.projectId !== "your-project-id";

  return NextResponse.json({
    status: isConfigured ? "configured" : "not-configured",
    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,
    apiVersion: sanityConfig.apiVersion,
  });
}

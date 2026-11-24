import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
import { sanityFetch } from "@/sanity/lib/fetch";
import { postSitemapQuery, type PostSitemapEntry } from "@/lib/sanity/queries";
import { programSlugsQuery } from "@/sanity/queries/programs";

type ProgramSlugResult = { slug: string };

const staticRoutes = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/programs", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/volunteer", changeFrequency: "monthly" as const, priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  let posts: PostSitemapEntry[] = [];
  let programs: ProgramSlugResult[] = [];

  try {
    [posts, programs] = await Promise.all([
      sanityFetch<PostSitemapEntry[]>(postSitemapQuery, {}, ["post"]),
      sanityFetch<ProgramSlugResult[]>(programSlugsQuery, {}, ["program"]),
    ]);
  } catch (error) {
    console.error("Failed to fetch dynamic sitemap entries:", error);
  }

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...programs
      .filter((program) => Boolean(program.slug))
      .map((program) => ({
        url: `${baseUrl}/programs/${encodeURIComponent(program.slug)}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ...posts
      .filter((post) => Boolean(post.slug))
      .map((post) => ({
        url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}

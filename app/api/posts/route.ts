import { NextResponse } from "next/server";

import { sanityFetch } from "@/sanity/lib/fetch";
import { POST_CATEGORIES } from "@/lib/post-categories";
import {
  DEFAULT_POSTS_PER_PAGE,
  postsCountQuery,
  postsQuery,
  type PostSummary,
  type PostsQueryParams,
} from "@/lib/sanity/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawCategory = url.searchParams.get("category");
  const category = rawCategory && (POST_CATEGORIES as readonly string[]).includes(rawCategory) ? rawCategory : null;
  const exclude = url.searchParams.get("exclude");

  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, 1000) : 1;
  const start = (page - 1) * DEFAULT_POSTS_PER_PAGE;
  const end = start + DEFAULT_POSTS_PER_PAGE;

  const params: PostsQueryParams = { start, end, category, exclude };

  try {
    const [posts, total] = await Promise.all([
      sanityFetch<PostSummary[]>(postsQuery, params, ["post"]),
      sanityFetch<number>(postsCountQuery, params, ["post"]),
    ]);

    return NextResponse.json({
      posts: posts ?? [],
      total: total ?? 0,
      page,
      pageSize: DEFAULT_POSTS_PER_PAGE,
      hasMore: start + (posts?.length ?? 0) < (total ?? 0),
    });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Could not load posts right now." }, { status: 502 });
  }
}

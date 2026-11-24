import type { Metadata } from "next";

import BlogListing from "@/components/blog/BlogListing";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  DEFAULT_POSTS_PER_PAGE,
  featuredPostQuery,
  postsCountQuery,
  postsQuery,
  type PostSummary,
} from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, program updates and stories from the communities we work with.",
};

export const revalidate = 60;

export default async function BlogPage() {
  let featured: PostSummary | null = null;
  let posts: PostSummary[] = [];
  let total = 0;

  try {
    featured = await sanityFetch<PostSummary | null>(featuredPostQuery, {}, ["post"]);
  } catch (error) {
    console.error("Failed to fetch featured post:", error);
  }

  if (!featured) {
    try {
      const newest = await sanityFetch<PostSummary[]>(
        postsQuery,
        { start: 0, end: 1, category: null, exclude: null },
        ["post"],
      );
      featured = newest?.[0] ?? null;
    } catch (error) {
      console.error("Failed to fetch newest post:", error);
    }
  }

  try {
    const params = { start: 0, end: DEFAULT_POSTS_PER_PAGE, category: null, exclude: featured?.slug ?? null };
    const [results, count] = await Promise.all([
      sanityFetch<PostSummary[]>(postsQuery, params, ["post"]),
      sanityFetch<number>(postsCountQuery, params, ["post"]),
    ]);
    posts = results ?? [];
    total = count ?? 0;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  return (
    <div className="blog-page">
      <header className="blog-page-head">
        <h1>Stories from the field</h1>
        <p>
          News, program updates and the voices behind our work with communities across Lagos.
        </p>
      </header>

      <BlogListing featured={featured} initialPosts={posts} initialTotal={total} />
    </div>
  );
}

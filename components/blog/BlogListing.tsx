"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PostSummary } from "@/lib/sanity/queries";
import { POST_CATEGORIES, type PostCategory } from "@/lib/post-categories";

const CATEGORIES = POST_CATEGORIES;
type Category = PostCategory;

type ApiResponse = {
  posts: PostSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  error?: string;
};

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function blurProps(image: PostSummary["coverImage"]) {
  return image?.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {};
}

function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="blog-card">
      <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="blog-card-link">
        <div className="blog-card-media">
          {post.coverImage?.url ? (
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
              {...blurProps(post.coverImage)}
            />
          ) : (
            <span className="blog-card-media-fallback" aria-hidden="true" />
          )}
        </div>
        <div className="blog-card-body">
          <div className="blog-card-meta">
            <span className="blog-chip">{post.category}</span>
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          </div>
          <h3>{post.title}</h3>
          {post.excerpt && <p>{post.excerpt}</p>}
          <span className="blog-card-cta">Read article <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}

export default function BlogListing({
  featured,
  initialPosts,
  initialTotal,
}: {
  featured: PostSummary | null;
  initialPosts: PostSummary[];
  initialTotal: number;
}) {
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length < initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    return () => {
      requestRef.current += 1;
    };
  }, []);

  async function load(nextPage: number, nextCategory: Category | null, append: boolean) {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(nextPage) });
      if (nextCategory) params.set("category", nextCategory);
      if (featured?.slug) params.set("exclude", featured.slug);

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = (await response.json()) as ApiResponse;
      if (requestId !== requestRef.current) return;
      if (!response.ok) throw new Error(data.error || "Could not load posts.");

      setPosts((current) => (append ? [...current, ...data.posts] : data.posts));
      setTotal(data.total);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (cause) {
      if (requestId !== requestRef.current) return;
      setError(cause instanceof Error ? cause.message : "Could not load posts.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }

  function selectCategory(next: Category | null) {
    if (next === category) return;
    setCategory(next);
    void load(1, next, false);
  }

  const isEmpty = posts.length === 0 && !loading;

  return (
    <div className="blog-listing">
      {featured && (
        <article className="blog-featured">
          <Link href={`/blog/${encodeURIComponent(featured.slug)}`} className="blog-featured-link">
            <div className="blog-featured-media">
              {featured.coverImage?.url ? (
                <Image
                  src={featured.coverImage.url}
                  alt={featured.coverImage.alt || featured.title}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 60vw"
                  {...blurProps(featured.coverImage)}
                />
              ) : (
                <span className="blog-card-media-fallback" aria-hidden="true" />
              )}
            </div>
            <div className="blog-featured-body">
              <div className="blog-card-meta">
                <span className="blog-chip">{featured.category}</span>
                {featured.publishedAt && <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>}
              </div>
              <h2>{featured.title}</h2>
              {featured.excerpt && <p>{featured.excerpt}</p>}
              <span className="blog-card-cta">Read the story <span aria-hidden="true">→</span></span>
            </div>
          </Link>
        </article>
      )}

      <div className="blog-toolbar">
        <div className="blog-filters" role="group" aria-label="Filter posts by category">
          <button
            type="button"
            className={`blog-filter${category === null ? " active" : ""}`}
            aria-pressed={category === null}
            onClick={() => selectCategory(null)}
          >
            All
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={`blog-filter${category === item ? " active" : ""}`}
              aria-pressed={category === item}
              onClick={() => selectCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="blog-count" aria-live="polite">
          {total} {total === 1 ? "article" : "articles"}
        </p>
      </div>

      {error && (
        <p className="blog-error" role="alert">
          {error} <button type="button" onClick={() => void load(1, category, false)}>Try again</button>
        </p>
      )}

      {isEmpty ? (
        <div className="blog-empty">
          <h2>{category ? `No ${category} posts yet` : "No posts published yet"}</h2>
          <p>
            {category
              ? "Try another category or check back soon for new stories from the field."
              : "Our stories from the field are on their way. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {hasMore && (
        <div className="blog-load-more">
          <button
            type="button"
            className="act-btn act-btn-primary"
            onClick={() => void load(page + 1, category, true)}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

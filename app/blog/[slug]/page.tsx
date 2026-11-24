import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PortableBody from "@/components/blog/PortableBody";
import ShareButtons from "@/components/blog/ShareButtons";
import { sanityFetch } from "@/sanity/lib/fetch";
import { normalizeAlt } from "@/lib/alt-text";
import {
  postBySlugQuery,
  postSlugsQuery,
  relatedPostsQuery,
  type Post,
  type PostSlug,
  type PostSummary,
} from "@/lib/sanity/queries";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const entries = await sanityFetch<PostSlug[]>(postSlugsQuery, {}, ["post"]);
    return (entries ?? []).filter((entry) => Boolean(entry.slug)).map((entry) => ({ slug: entry.slug }));
  } catch (error) {
    console.error("Failed to fetch post slugs:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let post: Post | null = null;
  try {
    post = await sanityFetch<Post | null>(postBySlugQuery, { slug }, ["post"]);
  } catch (error) {
    console.error("Failed to fetch post metadata:", error);
  }

  if (!post) return { title: "Article not found" };

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || undefined;
  const image = post.seo?.ogImage?.url || post.coverImage?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: post.author ? [post.author] : undefined,
      images: image ? [{ url: image, alt: post.seo?.ogImage?.alt || post.coverImage?.alt || post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function countWords(value: unknown): number {
  if (typeof value === "string") return value.trim().split(/\s+/).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce<number>((total, item) => total + countWords(item), 0);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const skip = new Set(["_type", "_key", "url", "href", "alt", "caption", "lqip", "_ref"]);
    return Object.entries(record).reduce<number>(
      (total, [key, item]) => total + (skip.has(key) ? 0 : countWords(item)),
      0,
    );
  }
  return 0;
}

function readTime(body: Post["body"]) {
  return Math.max(1, Math.ceil(countWords(body) / 200));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  let post: Post | null = null;
  try {
    post = await sanityFetch<Post | null>(postBySlugQuery, { slug }, ["post"]);
  } catch (error) {
    console.error("Failed to fetch post:", error);
  }
  if (!post) notFound();

  let related: PostSummary[] = [];
  try {
    related = await sanityFetch<PostSummary[]>(
      relatedPostsQuery,
      { slug: post.slug, category: post.category },
      ["post"],
    );
  } catch (error) {
    console.error("Failed to fetch related posts:", error);
  }

  return (
    <article className="blog-post-page">
      <header className="blog-post-head">
        <Link className="blog-back-link" href="/blog">&#8592; All articles</Link>
        <div className="blog-post-meta">
          <span className="blog-chip">{post.category}</span>
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
        </div>
        <h1>{post.title}</h1>
        {post.excerpt && <p className="blog-post-standfirst">{post.excerpt}</p>}
        <div className="blog-post-byline">
          <span>By <strong>{post.author}</strong></span>
          <span aria-hidden="true">·</span>
          <span>{readTime(post.body)} min read</span>
        </div>
      </header>

      {post.coverImage?.url && (
        <div className="blog-post-cover">
          <Image
            src={post.coverImage.url}
            alt={normalizeAlt(post.coverImage.alt, post.title)}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 1100px"
            {...(post.coverImage.lqip ? { placeholder: "blur" as const, blurDataURL: post.coverImage.lqip } : {})}
          />
        </div>
      )}

      <div className="blog-post-content">
        <ShareButtons title={post.title} />
        <PortableBody value={post.body ?? []} />
        <ShareButtons title={post.title} />
      </div>

      {related.length > 0 && (
        <section className="blog-related" aria-labelledby="blog-related-title">
          <div className="blog-related-head">
            <h2 id="blog-related-title">More in {post.category}</h2>
            <Link href="/blog">View all articles <span aria-hidden="true">→</span></Link>
          </div>
          <div className="blog-grid">
            {related.map((item) => (
              <article className="blog-card" key={item._id}>
                <Link href={`/blog/${encodeURIComponent(item.slug)}`} className="blog-card-link">
                  <div className="blog-card-media">
                    {item.coverImage?.url ? (
                      <Image
                        src={item.coverImage.url}
                        alt={normalizeAlt(item.coverImage.alt, item.title)}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        {...(item.coverImage.lqip ? { placeholder: "blur" as const, blurDataURL: item.coverImage.lqip } : {})}
                      />
                    ) : (
                      <span className="blog-card-media-fallback" aria-hidden="true" />
                    )}
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span className="blog-chip">{item.category}</span>
                      {item.publishedAt && <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>}
                    </div>
                    <h3>{item.title}</h3>
                    {item.excerpt && <p>{item.excerpt}</p>}
                    <span className="blog-card-cta">Read article <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

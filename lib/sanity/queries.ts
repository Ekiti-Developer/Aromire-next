import { defineQuery } from 'next-sanity'

import { POST_CATEGORIES, type PostCategory } from '@/lib/post-categories'

export { POST_CATEGORIES }
export type { PostCategory }

/** Fields shared by every image projection. */
const imageFields = `{
  "url": asset->url,
  "alt": alt,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "aspectRatio": asset->metadata.dimensions.aspectRatio
}`

/** Fields shared by the list, single-post and related-post projections. */
const postCardFields = `{
  _id,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, ""),
  "publishedAt": coalesce(publishedAt, date),
  "author": coalesce(author, authorRef->name, "Aromire-Éko Foundation"),
  "category": coalesce(category, categories[0]->title, "News"),
  tags,
  featured,
  "coverImage": coalesce(coverImage, cover, mainImage)${imageFields}
}`

export const DEFAULT_POSTS_PER_PAGE = 6

export type SanityImage = {
  url: string | null
  alt: string | null
  lqip?: string | null
  width?: number | null
  height?: number | null
  aspectRatio?: number | null
  caption?: string | null
}

/** Portable Text blocks are rendered with @portabletext/react on the front end. */
export type PortableTextBlock = {
  _type: string
  _key?: string
  [key: string]: unknown
}

export type PostSummary = {
  _id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string | null
  author: string
  category: string
  tags: string[] | null
  featured: boolean | null
  coverImage: SanityImage | null
}

export type Post = PostSummary & {
  body: PortableTextBlock[]
  seo: {
    metaTitle: string
    metaDescription: string | null
    ogImage: SanityImage | null
  }
}

export type PostSlug = { slug: string }

export type PostsQueryParams = {
  start: number
  end: number
  /** Pass null (or omit) to return every category. */
  category?: string | null
  /** Post slug to leave out of the list (e.g. the featured post). */
  exclude?: string | null
}

export type PostBySlugParams = { slug: string }
export type RelatedPostsParams = { slug: string; category: string }
export type PostSitemapEntry = { slug: string; publishedAt: string | null }

/**
 * Paginated, newest-first post list. `$category` is optional: pass null to
 * disable the filter. `$start`/`$end` use GROQ's exclusive slice syntax.
 */
const categoryMatch = `($category == null || category == $category || categories[0]->title == $category)`

export const postsQuery = defineQuery(`*[
  _type == "post" && isSample != true &&
  ${categoryMatch} &&
  ($exclude == null || slug.current != $exclude)
] | order(publishedAt desc, _createdAt desc) [$start...$end] ${postCardFields}`)

/** Total number of matching posts, for pagination controls. */
export const postsCountQuery = defineQuery(`count(*[
  _type == "post" && isSample != true &&
  ${categoryMatch} &&
  ($exclude == null || slug.current != $exclude)
])`)

/** The featured post, falling back to the newest post at the page level. */
export const featuredPostQuery = defineQuery(`*[
  _type == "post" && isSample != true && featured == true
] | order(publishedAt desc, _createdAt desc) [0] ${postCardFields}`)

/** Slugs and dates for the sitemap. */
export const postSitemapQuery = defineQuery(`*[_type == "post" && isSample != true]{
  "slug": slug.current,
  "publishedAt": coalesce(publishedAt, date)
}`)

/** A single post with Portable Text body and expanded image assets. */
export const postBySlugQuery = defineQuery(`*[
  _type == "post" && slug.current == $slug && isSample != true
][0]{
  _id,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, ""),
  "publishedAt": coalesce(publishedAt, date),
  "author": coalesce(author, authorRef->name, "Aromire-Éko Foundation"),
  "category": coalesce(category, categories[0]->title, "News"),
  tags,
  featured,
  "coverImage": coalesce(coverImage, cover, mainImage)${imageFields},
  body[]{
    ...,
    _type == "image" => {
      ...,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  },
  "seo": {
    "metaTitle": coalesce(seo.metaTitle, title),
    "metaDescription": coalesce(seo.metaDescription, excerpt),
    "ogImage": seo.ogImage${imageFields}
  }
}`)

/** Slugs for generateStaticParams. */
export const postSlugsQuery = defineQuery(`*[_type == "post" && isSample != true]{
  "slug": slug.current
}`)

/** Up to three newer posts in the same category, excluding the current post. */
export const relatedPostsQuery = defineQuery(`*[
  _type == "post" && isSample != true &&
  slug.current != $slug &&
  (category == $category || categories[0]->title == $category)
] | order(publishedAt desc, _createdAt desc) [0...3] ${postCardFields}`)

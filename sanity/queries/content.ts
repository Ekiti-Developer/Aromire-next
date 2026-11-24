export type SanityImage = {
  url: string | null;
  alt: string | null;
  lqip?: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
};

export type HeroSlide = {
  _id: string;
  order: number;
  kicker: string | null;
  headline: string;
  text: string | null;
  image: SanityImage | null;
  primaryCta: {label: string; linkType: 'internal' | 'external'; internalPage: string | null; externalUrl: string | null};
  secondaryCta: {label: string; linkType: 'internal' | 'external'; internalPage: string | null; externalUrl: string | null} | null;
};

export type ImpactStat = {_id: string; order: number; value: number; suffix: string | null; label: string};

export type StandSection = {
  _id: string;
  order: number;
  heading: string;
  lead: string;
  layout: 'imageLeft' | 'imageRight';
  image: SanityImage | null;
  pillars: {title: string; text: string}[];
  cta: HeroSlide['primaryCta'];
};

export type ProgramSummary = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  startDate: string;
  endDate: string | null;
  cover: SanityImage | null;
};

export type ProgramDetail = ProgramSummary & {
  hook: string | null;
  intro: string | null;
  ending: string | null;
  partnersCount: number | null;
  locations: {_id: string; name: string; address: string | null; geo: {lat: number; lng: number} | null}[];
  chapters: {
    _key: string;
    dayLabel: string;
    date: string | null;
    headline: string;
    narrative: string;
    pullQuote: {text: string; attribution: string | null} | null;
    locations: {_id: string; name: string; address: string | null}[];
    photos: {
      _key: string;
      mediaType: 'image' | 'video';
      image: SanityImage | null;
      videoUrl: string | null;
      poster: SanityImage | null;
      caption: string;
      storyLine: string | null;
      location: {_id: string; name: string; address: string | null} | null;
    }[];
  }[];
  featuredTestimonial: Testimonial | null;
};

export type Testimonial = {
  _id: string;
  name: string;
  role: string | null;
  quote: string;
  photo: SanityImage | null;
  videoUrl: string | null;
  videoPoster: SanityImage | null;
  program: {title: string; slug: string} | null;
};

// Blog queries and types live in lib/sanity/queries.ts (single source of truth).
export type {
  PostSummary as BlogPostSummary,
  Post,
  PostSlug,
  PostCategory,
  PortableTextBlock,
} from '@/lib/sanity/queries';
export {
  postsQuery as blogPostsQuery,
  postBySlugQuery as blogPostBySlugQuery,
  postsCountQuery,
  postSlugsQuery,
  relatedPostsQuery,
} from '@/lib/sanity/queries';

const imageProjection = `"url": asset->url, alt, "lqip": asset->metadata.lqip, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "aspectRatio": asset->metadata.dimensions.aspectRatio`;

export type Pillar = {
  _id: string;
  title: string;
  text: string;
  imageUrl: string | null;
  imageLqip: string | null;
  imageAlt: string | null;
  order: number;
};

export const pillarsQuery = `*[_type == "pillar" && isSample != true] | order(coalesce(sortOrder, order, 0) asc) {
  _id,
  "title": coalesce(heading, title),
  "text": coalesce(description, text),
  "imageUrl": image.asset->url,
  "imageLqip": image.asset->metadata.lqip,
  imageAlt,
  "order": coalesce(sortOrder, order, 0)
}`;

const programSummaryProjection = `{
  _id, title, "slug": slug.current, summary, startDate, endDate,
  "cover": cover{${imageProjection}}
}`;

export const featuredProgramsQuery = `*[_type == "program" && status == "published" && featuredOnHome == true && isSample != true] | order(startDate desc) ${programSummaryProjection}`;

export const programsQuery = `*[_type == "program" && status == "published" && isSample != true] | order(startDate desc) ${programSummaryProjection}`;

export const programBySlugQuery = `*[_type == "program" && slug.current == $slug && status == "published" && isSample != true][0]{
  _id, title, "slug": slug.current, summary, startDate, endDate, hook, intro, ending, partnersCount,
  "cover": cover{${imageProjection}},
  "locations": locations[]->{_id, name, address, geo},
  chapters[]{
    _key, dayLabel, date, headline, narrative, pullQuote,
    "locations": locations[]->{_id, name, address},
    photos[]{
      _key, mediaType, caption, storyLine, videoUrl,
      "image": image{${imageProjection}},
      "poster": poster{${imageProjection}},
      "location": location->{_id, name, address}
    }
  },
  "featuredTestimonial": select(
    featuredTestimonial->consentConfirmed == true && featuredTestimonial->isSample != true => featuredTestimonial->{
    _id, name, role, quote, videoUrl, "program": program->{title, "slug": slug.current},
    "photo": photo{${imageProjection}},
    "videoPoster": videoPoster{${imageProjection}}
    }
  )
}`;

export const testimonialsQuery = `*[_type == "testimonial" && consentConfirmed == true && isSample != true] | order(_createdAt desc) {
  _id, name, role, quote, videoUrl,
  "program": program->{title, "slug": slug.current},
  "photo": photo{${imageProjection}},
  "videoPoster": videoPoster{${imageProjection}}
}`;



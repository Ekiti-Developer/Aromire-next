/**
 * GROQ queries for the Programs/Storybook feature
 */

// Query for the programs list page
export const programsListQuery = `*[_type == "program" && status == "published" && isSample != true] | order(startDate desc) {
  _id,
  title,
  "slug": slug.current,
  summary,
  startDate,
  endDate,
  "cover": {
    "url": cover.asset->url,
    "alt": cover.alt,
    "lqip": cover.asset->metadata.lqip,
    "dimensions": cover.asset->metadata.dimensions
  },
  "daysCount": count(chapters),
  "locationsCount": count(locations),
  "photosCount": count(chapters[].photos)
}`;

// Query for a single program by slug (for the story page)
export const programBySlugQuery = `*[_type == "program" && slug.current == $slug && status == "published" && isSample != true][0] {
  _id,
  title,
  "slug": slug.current,
  status,
  summary,
  hook,
  intro,
  ending,
  "cover": {
    "url": cover.asset->url,
    "alt": cover.alt,
    "lqip": cover.asset->metadata.lqip,
    "dimensions": cover.asset->metadata.dimensions
  },
  startDate,
  endDate,
  partnersCount,
  storyCta,
  "partners": partners[]-> | order(coalesce(sortOrder, 999) asc, name asc) {
    _id,
    name,
    website,
    sortOrder,
    "logo": logo.asset->url,
    "logoAlt": logo.alt
  },
  "locations": locations[]->{
    _id,
    name,
    address,
    geo
  },
  "chapters": chapters[]{
    _key,
    dayLabel,
    date,
    headline,
    narrative,
    pullQuote,
    "locations": locations[]->{
      _id,
      name,
      address,
      geo
    },
    "photos": photos[]{
      _key,
      mediaType,
      "image": select(
        mediaType == "image" => {
          "url": image.asset->url,
          "alt": image.alt,
          "lqip": image.asset->metadata.lqip,
          "dimensions": image.asset->metadata.dimensions
        }
      ),
      videoUrl,
      "poster": select(
        mediaType == "video" => {
          "url": poster.asset->url,
          "alt": poster.alt,
          "lqip": poster.asset->metadata.lqip,
          "dimensions": poster.asset->metadata.dimensions
        }
      ),
      caption,
      storyLine,
      "location": location->{
        _id,
        name,
        address
      }
    }
  },
  "featuredTestimonial": featuredTestimonial->{
    _id,
    name,
    role,
    quote,
    "photo": {
      "url": photo.asset->url,
      "alt": photo.alt,
      "lqip": photo.asset->metadata.lqip
    },
    videoUrl,
    "videoPoster": {
      "url": videoPoster.asset->url,
      "alt": videoPoster.alt,
      "lqip": videoPoster.asset->metadata.lqip
    },
    consentConfirmed
  },
  featuredOnHome
}`;

// Query for program metadata (for generateMetadata)
export const programMetadataQuery = `*[_type == "program" && slug.current == $slug && status == "published" && isSample != true][0] {
  title,
  summary,
  "coverUrl": cover.asset->url
}`;

// Query for generating static params
export const programSlugsQuery = `*[_type == "program" && status == "published" && isSample != true] {
  "slug": slug.current
}`;

// Query for next program (used in "Next story" link)
export const nextProgramQuery = `*[_type == "program" && status == "published" && isSample != true && startDate > $currentStartDate] | order(startDate asc) [0] {
  _id,
  title,
  "slug": slug.current
}`;

// Query for featured programs on home page
export const featuredProgramsQuery = `*[_type == "program" && status == "published" && featuredOnHome == true && isSample != true] | order(startDate desc) [0...3] {
  _id,
  title,
  "slug": slug.current,
  summary,
  "cover": {
    "url": cover.asset->url,
    "alt": cover.alt,
    "lqip": cover.asset->metadata.lqip
  }
}`;

export type ProgramsList = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  startDate: string;
  endDate?: string;
  cover: {
    url: string;
    alt: string;
    lqip?: string;
    dimensions?: {width: number; height: number};
  };
  daysCount: number;
  locationsCount: number;
  photosCount: number;
};

export type ProgramLocation = {
  _id: string;
  name: string;
  address?: string;
  geo?: {lat: number; lng: number};
};

export type ProgramPhoto = {
  _key: string;
  mediaType: 'image' | 'video';
  image?: {
    url: string;
    alt: string;
    lqip?: string;
    dimensions?: {width: number; height: number};
  };
  videoUrl?: string;
  poster?: {
    url: string;
    alt: string;
    lqip?: string;
    dimensions?: {width: number; height: number};
  };
  caption: string;
  storyLine?: string;
  location: {
    _id: string;
    name: string;
    address?: string;
  };
};

export type ProgramChapter = {
  _key: string;
  dayLabel: string;
  date?: string;
  headline: string;
  narrative: string;
  pullQuote?: {
    text: string;
    attribution?: string;
  };
  locations: ProgramLocation[];
  photos: ProgramPhoto[];
};

export type ProgramDetail = {
  _id: string;
  title: string;
  slug: string;
  status: string;
  summary: string;
  hook?: string;
  intro?: string;
  ending?: string;
  cover: {
    url: string;
    alt: string;
    lqip?: string;
    dimensions?: {width: number; height: number};
  };
  startDate: string;
  endDate?: string;
  partnersCount?: number;
  storyCta?: {label?: string; href?: string};
  partners?: Array<{
    _id: string;
    name: string;
    website?: string;
    sortOrder?: number;
    logo?: string;
    logoAlt?: string;
  }>;
  locations: ProgramLocation[];
  chapters: ProgramChapter[];
  featuredTestimonial?: {
    _id: string;
    name: string;
    role?: string;
    quote: string;
    photo?: {
      url: string;
      alt?: string;
      lqip?: string;
    };
    videoUrl?: string;
    videoPoster?: {
      url: string;
      alt?: string;
      lqip?: string;
    };
    consentConfirmed: boolean;
  };
  featuredOnHome: boolean;
};

export const aboutPageQuery = `*[_type == "aboutPage"][0] {
  title,
  eyebrow,
  heading,
  intro,
  mission,
  vision,
  values,
  approach,
  "imageUrl": image.asset->url
}`;

export const aboutPageMetadataQuery = `*[_type == "aboutPage"][0]{seoTitle, title}`;
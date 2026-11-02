export type Partner = {
  _id: string;
  name: string;
  logoUrl: string;
  logoAlt: string | null;
  website: string | null;
};

export const partnersQuery = `*[_type == "partner"] | order(sortOrder asc, name asc) {
  _id,
  name,
  "logoUrl": logo.asset->url,
  "logoAlt": logo.alt,
  website
}`;
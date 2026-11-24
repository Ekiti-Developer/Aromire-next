export type Partner = {
  _id: string
  name: string
  logoUrl: string | null
  logoAlt: string | null
  logoLqip: string | null
  website: string | null
  sortOrder: number | null
}

export const partnersQuery = `*[_type == "partner" && isSample != true] | order(coalesce(sortOrder, 999) asc, name asc) {
  _id,
  name,
  sortOrder,
  "logoUrl": logo.asset->url,
  "logoLqip": logo.asset->metadata.lqip,
  "logoAlt": logo.alt,
  website
}`

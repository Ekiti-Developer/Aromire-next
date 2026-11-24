import { client } from "@/lib/sanity/client";

type SanityParams = Record<string, unknown>;

export function sanityFetch<T>(
  query: string,
  params: SanityParams = {},
  tags: string[] = [],
): Promise<T> {
  return client.fetch<T>(query, params, { next: { tags } });
}

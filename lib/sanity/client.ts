import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '@/sanity/env'

/**
 * Single source of truth for Sanity connection settings.
 * IDs and API version come from environment variables (see sanity/env.ts),
 * never from hard-coded values.
 */
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published" as const,
  /** Used by app/api/revalidate to verify Sanity webhook signatures. */
  revalidateSecret: process.env.SANITY_REVALIDATE_SECRET,
}

export const client = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: sanityConfig.useCdn,
  perspective: sanityConfig.perspective,
})

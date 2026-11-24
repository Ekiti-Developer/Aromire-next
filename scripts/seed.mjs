import {createReadStream} from 'node:fs'
import {resolve} from 'node:path'
import {createClient} from '@sanity/client'

const isApply = process.argv.includes('--apply')
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-11-01'
const token = process.env.SANITY_API_TOKEN
const logoPath = resolve(process.cwd(), 'public', 'images', 'Logo.svg')

const docs = [
  { _id: 'sample-location-community', _type: 'location', name: 'Sample community location', address: 'Sample address only', isSample: true },
  { _id: 'sample-location-learning', _type: 'location', name: 'Sample learning location', address: 'Sample address only', isSample: true },
  ...[
    ['sample-hero-1', 0],
    ['sample-hero-2', 1],
    ['sample-hero-3', 2],
  ].map(([_id, order]) => ({
    _id,
    _type: 'heroSlide',
    order,
    kicker: 'SAMPLE CONTENT',
    headline: `Placeholder hero headline ${order + 1}`,
    text: 'Replace this sample copy with approved organisation content.',
    primaryCta: {_type: 'ctaLink', label: 'View programs', linkType: 'internal', internalPage: '/programs'},
    isSample: true,
  })),
  ...[
    ['sample-stat-1', 0],
    ['sample-stat-2', 1],
    ['sample-stat-3', 2],
  ].map(([_id, order]) => ({
    _id,
    _type: 'impactStat',
    order,
    value: 0,
    label: `Sample metric ${order + 1}`,
    isSample: true,
  })),
  ...[
    ['sample-stand-1', 0],
    ['sample-stand-2', 1],
    ['sample-stand-3', 2],
  ].map(([_id, order]) => ({
    _id,
    _type: 'standSection',
    order,
    heading: `Sample section ${order + 1}`,
    lead: 'Placeholder content for the homepage.',
    pillars: [
      {_type: 'standPillar', _key: `pillar-${order}-1`, title: 'Sample pillar', text: 'Replace with approved content.'},
      {_type: 'standPillar', _key: `pillar-${order}-2`, title: 'Sample pillar', text: 'Replace with approved content.'},
      {_type: 'standPillar', _key: `pillar-${order}-3`, title: 'Sample pillar', text: 'Replace with approved content.'},
    ],
    cta: {_type: 'ctaLink', label: 'View programs', linkType: 'internal', internalPage: '/programs'},
    layout: order % 2 ? 'imageLeft' : 'imageRight',
    isSample: true,
  })),
  {
    _id: 'sample-program',
    _type: 'program',
    title: 'Sample community program',
    slug: {_type: 'slug', current: 'sample-community-program'},
    status: 'published',
    summary: 'Placeholder program summary. Replace before publishing real content.',
    startDate: '2025-01-01',
    endDate: '2025-01-01',
    locations: [{_type: 'reference', _ref: 'sample-location-community'}],
    chapters: [{
      _type: 'programChapter',
      _key: 'sample-chapter-1',
      dayLabel: 'Sample day',
      date: '2025-01-01',
      headline: 'Placeholder chapter headline',
      narrative: 'Placeholder chapter text.',
      locations: [{_type: 'reference', _ref: 'sample-location-community'}],
      photos: [],
    }],
    featuredOnHome: true,
    isSample: true,
  },
  {
    _id: 'sample-testimonial',
    _type: 'testimonial',
    name: 'Sample participant',
    role: 'Sample role',
    quote: 'Placeholder testimonial. This is not a real participant statement.',
    program: {_type: 'reference', _ref: 'sample-program'},
    consentConfirmed: false,
    isSample: true,
  },
  {
    _id: 'sample-post',
    _type: 'post',
    title: 'Sample blog post',
    slug: {_type: 'slug', current: 'sample-blog-post'},
    excerpt: 'Placeholder excerpt.',
    date: '2025-01-01T00:00:00Z',
    body: [{_type: 'block', _key: 'sample-block', style: 'normal', markDefs: [], children: [{_type: 'span', _key: 'sample-span', text: 'Replace this sample article content before publishing.', marks: []}]}],
    isSample: true,
  },
]

console.log(`Prepared ${docs.length} sample documents; all are marked isSample: true.`)
if (!isApply) {
  console.log('Dry run only. Set Sanity environment values, provide SANITY_API_TOKEN, and pass --apply to write sample documents.')
  process.exit(0)
}

if (!projectId || !dataset || !token) {
  throw new Error('Applying seed data requires NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_TOKEN.')
}

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})
const logo = await client.assets.upload('image', createReadStream(logoPath), {filename: 'Logo.svg'})
for (const doc of docs) {
  if (['heroSlide', 'standSection', 'program'].includes(doc._type)) {
    doc.image = doc._type === 'heroSlide' || doc._type === 'standSection'
      ? {_type: 'image', asset: {_type: 'reference', _ref: logo._id}, alt: 'Sample organisation logo'}
      : undefined
    if (doc._type === 'program') {
      doc.cover = {_type: 'image', asset: {_type: 'reference', _ref: logo._id}, alt: 'Sample organisation logo'}
      delete doc.image
    }
  }
}

const transaction = client.transaction()
for (const doc of docs) transaction.createOrReplace(doc)
await transaction.commit()
console.log(`Created or replaced ${docs.length} sample documents and uploaded a sample logo asset.`)

// lib/imageUrl.ts
import imageUrlBuilder from '@sanity/image-url'
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion: '2024-05-01', // or your preferred version
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

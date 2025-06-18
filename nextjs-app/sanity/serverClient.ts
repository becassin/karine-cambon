// lib/sanity.server.ts

import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_IMAGE_PUBLICATOR_TOKEN!, // needs write access
  apiVersion: '2023-01-01',
  useCdn: false,
});

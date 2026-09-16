import 'server-only'

import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from './env'

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: 'published',
})


import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || 'zhc68b02',
    dataset: process.env.SANITY_DATASET || 'production',
  },
})


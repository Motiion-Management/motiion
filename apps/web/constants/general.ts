export const domain =
  process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL!
    : 'http://localhost:3000'

import { z } from 'zod'

// Client-safe Convex ID marker for use in React Native/web bundles.
// We encode the table name in the description so frontend can detect relationships/files.
export function clientZid(table: string) {
  return z.string().describe(`convexId:${table}`)
}


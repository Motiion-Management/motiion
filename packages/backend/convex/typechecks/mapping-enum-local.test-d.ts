// Backend-local pure mapping probe for optional ZodEnum
// Goal: isolate mapping-level typing without table wrappers
import type { VLiteral, VOptional, VUnion } from 'convex/values'
import { z } from 'zod'
import { zodToConvexFields } from 'zodvex'
import type { Expect, Equal } from './EXPECT'

// Minimal local shapes (no external imports)
const localShape = {
  two: z.enum(['alpha', 'beta']).optional(),
  one: z.enum(['only']).optional()
}

const localFields = zodToConvexFields(localShape)

type TwoField = typeof localFields['two']
type OneField = typeof localFields['one']

type ExpectedTwo = VUnion<'alpha' | 'beta' | undefined, any[], 'optional', any>
type ExpectedOne = VUnion<'only' | undefined, any[], 'optional', any>

type _assertTwo = Expect<Equal<TwoField, ExpectedTwo>>
type _assertOne = Expect<Equal<OneField, ExpectedOne>>


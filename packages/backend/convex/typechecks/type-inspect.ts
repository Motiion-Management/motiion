// Type inspection to understand what TypeScript sees
import type { VLiteral, VOptional, VUnion } from 'convex/values'
import { z } from 'zod'
import { zodToConvexFields } from 'zodvex'

const localShape = {
  two: z.enum(['alpha', 'beta']).optional(),
  one: z.enum(['only']).optional()
}

const localFields = zodToConvexFields(localShape)

type TwoField = typeof localFields['two']
type OneField = typeof localFields['one']

// Let's see what the actual types are
type TwoInspect = TwoField extends VOptional<infer Inner> ? { isVOptional: true, Inner: Inner } : { isVOptional: false, Actual: TwoField }
type OneInspect = OneField extends VOptional<infer Inner> ? { isVOptional: true, Inner: Inner } : { isVOptional: false, Actual: OneField }

// Also check if they're VUnion directly
type TwoIsUnion = TwoField extends VUnion<any, any, any> ? true : false
type OneIsLiteral = OneField extends VLiteral<any, any> ? true : false

// Export for inspection via tsc --showEmit or IDE hover
export type Debug = {
  TwoField: TwoField
  OneField: OneField
  TwoInspect: TwoInspect
  OneInspect: OneInspect
  TwoIsUnion: TwoIsUnion
  OneIsLiteral: OneIsLiteral
}

// Expected types
type ExpectedTwo = VOptional<VUnion<'alpha' | 'beta', any[], 'required'>>
type ExpectedOne = VOptional<VLiteral<'only', 'required'>>

// Check equality component by component
type TwoIsVOptional = TwoField extends VOptional<any> ? true : false
type TwoInnerIsVUnion = TwoField extends VOptional<infer I> ? I extends VUnion<any, any, any> ? true : false : false

type OneIsVOptional = OneField extends VOptional<any> ? true : false
type OneInnerIsVLiteral = OneField extends VOptional<infer I> ? I extends VLiteral<any, any> ? true : false : false

export type DebugStructure = {
  TwoIsVOptional: TwoIsVOptional
  TwoInnerIsVUnion: TwoInnerIsVUnion
  OneIsVOptional: OneIsVOptional
  OneInnerIsVLiteral: OneInnerIsVLiteral
}

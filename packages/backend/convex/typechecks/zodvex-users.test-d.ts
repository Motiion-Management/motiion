// Type-only test to introspect zodvex mapping for optional enums
import type { VLiteral, VOptional, VUnion } from 'convex/values'
import { z } from 'zod'
import { zodToConvexFields } from 'zodvex'
import { users as usersShape } from '../schemas/users'
import type { Expect, Equal } from './EXPECT'

// Build validators from the actual app shape
const fields = zodToConvexFields(usersShape)

type ProfileTypeField = typeof fields['profileType']
type ActiveProfileTypeField = typeof fields['activeProfileType']

// Expected: optional union of literals (resolved form)
type ExpectedProfileType = VUnion<
  'dancer' | 'choreographer' | 'guest' | undefined,
  any[],
  'optional',
  any
>
type ExpectedActiveProfileType = VUnion<
  'dancer' | 'choreographer' | undefined,
  any[],
  'optional',
  any
>

type _assertProfileType = Expect<Equal<ProfileTypeField, ExpectedProfileType>>
type _assertActiveProfileType = Expect<
  Equal<ActiveProfileTypeField, ExpectedActiveProfileType>
>


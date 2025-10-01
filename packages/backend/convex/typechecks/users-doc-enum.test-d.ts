// Type-only probe for Users.doc.fields enum typing
// This does not affect runtime; it helps pinpoint where specificity is lost.
import type { VOptional, VUnion } from 'convex/values'
import { Users } from '../schemas/users'
import type { Expect, Equal } from './EXPECT'

type Active = typeof Users.doc.fields['activeProfileType']
type Profile = typeof Users.doc.fields['profileType']

type _A = Expect<
  Equal<Active, VUnion<'dancer' | 'choreographer' | undefined, any[], 'optional', any>>
>
type _P = Expect<
  Equal<
    Profile,
    VUnion<'dancer' | 'choreographer' | 'guest' | undefined, any[], 'optional', any>
  >
>


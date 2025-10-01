// Simple test to inspect enum type structure
import { z } from 'zod'

// Create test enums
const arr = ['a', 'b'] as const
const testEnum = z.enum(arr)

// What is arr's type?
type ArrType = typeof arr
// Type: readonly ["a", "b"]

// What does z.enum expect?
// Let's see if we can manually check the constraint
type EnumLike = Readonly<Record<string, string | number>>

// Does readonly ["a", "b"] extend EnumLike?
type Test1 = readonly ["a", "b"] extends EnumLike ? true : false
// Should be false - arrays don't have string keys with EnumValue values

// What about an object?
type EnumObject = { a: "a", b: "b" }
type Test2 = EnumObject extends EnumLike ? true : false
// Should be true

export type { ArrType, Test1, Test2, EnumLike }

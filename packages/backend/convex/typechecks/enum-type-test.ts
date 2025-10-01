// Test to check the ZodEnum type signature in Zod v4
import { z } from 'zod'
import type { ConvexValidatorFromZod } from 'zodvex'

// Create a test enum
const testEnum = z.enum(['a', 'b'])
const optionalEnum = z.enum(['a', 'b']).optional()

// What is the inferred type of testEnum?
type TestEnumInferred = typeof testEnum

// Try to extract the generic parameter
type ExtractEnumParam<T> = T extends z.ZodEnum<infer U> ? U : 'not-enum'

type EnumParam = ExtractEnumParam<typeof testEnum>

// What does zodvex's type mapping produce?
type ConvexType = ConvexValidatorFromZod<typeof optionalEnum>

// Expose for inspection
export type { TestEnumInferred, EnumParam, ConvexType }

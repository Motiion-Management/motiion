// Diagnostic script to inspect actual types
import { z } from 'zod'
import { zodToConvexFields } from 'zodvex'

const localShape = {
  two: z.enum(['alpha', 'beta']).optional(),
  one: z.enum(['only']).optional()
}

const localFields = zodToConvexFields(localShape)

console.log('localFields.two:', JSON.stringify(localFields.two, null, 2))
console.log('localFields.one:', JSON.stringify(localFields.one, null, 2))

// Check the type property
console.log('\nlocalFields.two.type:', (localFields.two as any).type)
console.log('localFields.one.type:', (localFields.one as any).type)

// Check if it's a VOptional
console.log('\nlocalFields.two.isOptional:', (localFields.two as any).isOptional)
console.log('localFields.one.isOptional:', (localFields.one as any).isOptional)

// Check the value property (inner validator for VOptional)
if ((localFields.two as any).value) {
  console.log('\nlocalFields.two.value:', JSON.stringify((localFields.two as any).value, null, 2))
  console.log('localFields.two.value.type:', (localFields.two as any).value.type)
}

if ((localFields.one as any).value) {
  console.log('\nlocalFields.one.value:', JSON.stringify((localFields.one as any).value, null, 2))
  console.log('localFields.one.value.type:', (localFields.one as any).value.type)
}

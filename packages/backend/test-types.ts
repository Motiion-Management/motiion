import { Agencies } from './convex/schemas/agencies'

// Test if the table type is properly inferred
const table = Agencies.table
const name = Agencies.name
const schema = Agencies.schema

// This should have proper type
type TableType = typeof table
type NameType = typeof name  // Should be "agencies"
type SchemaType = typeof schema

console.log('Table type test:', {
  hasTable: 'table' in Agencies,
  hasName: 'name' in Agencies,
  hasSchema: 'schema' in Agencies
})
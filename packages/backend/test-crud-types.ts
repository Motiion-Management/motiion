import { query, mutation } from './convex/_generated/server'
import { Agencies } from './convex/schemas/agencies'
import { zCrud } from 'zodvex'

// Test CRUD typing
const crud = zCrud(Agencies, query, mutation)

// This should reveal the types
type CreateType = typeof crud.create
type ReadType = typeof crud.read
type UpdateType = typeof crud.update

console.log('CRUD types test passed')
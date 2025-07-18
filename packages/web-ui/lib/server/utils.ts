import { ClerkMiddlewareAuth, auth } from '@clerk/nextjs/server'
import { Doc, TableNames } from '@packages/backend/convex/_generated/dataModel'
import { preloadQuery, preloadedQueryResult } from 'convex/nextjs'
import { Preloaded } from 'convex/react'
import { FunctionReference } from 'convex/server'

export async function getAuthToken() {
  const authResult = await auth()
  return (await authResult.getToken({ template: 'convex' })) ?? undefined
}

export async function getMiddlewareAuthToken(clerkAuth: ClerkMiddlewareAuth) {
  const authResult = await clerkAuth()
  return (await authResult.getToken({ template: 'convex' })) ?? undefined
}

export async function preloadHelper<
  T extends TableNames,
  Q extends FunctionReference<'query'>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(query: Q, queryParams: any, table: T): Promise<[Preloaded<Q>, Doc<T>]> {
  const preloadedResult = await preloadQuery(query, queryParams)

  const result = preloadedQueryResult(preloadedResult)

  return [preloadedResult, result]
}

export async function preloadHelperWithToken<
  T extends TableNames,
  Q extends FunctionReference<'query'>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(query: Q, queryParams: any, table: T): Promise<[Preloaded<Q>, Doc<T>]> {
  const token = await getAuthToken()
  const preloadedResult = await preloadQuery(query, queryParams, { token })

  const result = preloadedQueryResult(preloadedResult)

  return [preloadedResult, result]
}

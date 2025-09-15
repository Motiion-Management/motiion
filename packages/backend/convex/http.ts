import { httpRouter } from 'convex/server'
// TODO(dx): Replace with typed wrappers around internal API to avoid deep generics.
// Temporary: dynamic import to prevent TS deep instantiation at call sites.
// See AGENTS.md type safety guidelines for intent and follow-up plan.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const internal: any = require('./_generated/api').internal
import { httpAction } from './_generated/server'

const http = httpRouter()

// http.route({
//   path: '/stripe',
//   method: 'POST',
//   handler: httpAction(async (ctx, request) => {
//     const signature = request.headers.get('stripe-signature') as string
//
//     const result = await ctx.runAction(internal.stripe.fulfill, {
//       payload: await request.text(),
//       signature
//     })
//
//     if (result.success) {
//       return new Response(null, {
//         status: 200
//       })
//     } else {
//       return new Response('Webhook Error - Stripe', {
//         status: 400
//       })
//     }
//   })
// })

http.route({
  path: '/clerk',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text()
    const headerPayload = request.headers

    try {
      const event = await (ctx as any).runAction(internal.clerk.fulfill, {
          payload: payloadString,
          headers: {
            'svix-id': headerPayload.get('svix-id')!,
            'svix-timestamp': headerPayload.get('svix-timestamp')!,
            'svix-signature': headerPayload.get('svix-signature')!
          }
      })

      switch (event.type) {
        case 'user.created': // intentional fallthrough
        // const customerId = await ctx.runAction(internal.stripe.createCustomer)
        // await ctx.runAction(internal.stripe.startTrial, { customerId })
        case 'user.updated':
          await (ctx as any).runMutation(internal.users.updateOrCreateUserByTokenId, {
              data: {
                tokenId: event.data.id,
                email: event.data.email_addresses[0]?.email_address,
                firstName: event.data.first_name || undefined,
                lastName: event.data.last_name || undefined,
                phone: event.data.phone_numbers[0]?.phone_number
              },
              eventType: event.type
          })

          break

        case 'user.deleted':
          await (ctx as any).runMutation(internal.users.deleteUserByTokenId, {
            tokenId: event.data.id!
          })
          break
      }

      return new Response(null, {
        status: 200
      })
    } catch (err) {
      console.error(err)
      return new Response('Webhook Error - Clerk', {
        status: 400
      })
    }
  })
})

export default http

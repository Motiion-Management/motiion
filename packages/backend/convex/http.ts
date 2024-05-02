import { httpRouter } from 'convex/server'

import { internal } from './_generated/api'
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
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          'svix-id': headerPayload.get('svix-id')!,
          'svix-timestamp': headerPayload.get('svix-timestamp')!,
          'svix-signature': headerPayload.get('svix-signature')!
        }
      })

      switch (result.type) {
        case 'user.created':
          console.log('Creating user')
          await ctx.runMutation(internal.users.create, {
            tokenId: result.data.id,
            type: 'member',
            isAdmin: false,
            email: result.data.email_addresses[0]?.email_address,
            firstName: result.data.first_name,
            lastName: result.data.last_name,
            phone: result.data.phone_numbers[0]?.phone_number,
            pointsEarned: 0
          })

          // const customerId = await ctx.runAction(internal.stripe.createCustomer)

          // await ctx.runAction(internal.stripe.startTrial, { customerId })

          break
        case 'user.updated':
          await ctx.runAction(internal.users.updateUserByTokenId, {
            tokenId: result.data.id,
            patch: {
              email: result.data.email_addresses[0]?.email_address,
              firstName: result.data.first_name,
              lastName: result.data.last_name,
              phone: result.data.phone_numbers[0]?.phone_number
            }
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

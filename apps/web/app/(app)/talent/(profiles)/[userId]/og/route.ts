import { Id } from '@packages/backend/convex/_generated/dataModel'
import { OGImage } from './og-image'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
// import { fetchPublicUser } from '@/lib/server/users'
// import { api } from '@packages/backend/convex/_generated/api'
// import { fetchQuery } from 'convex/nextjs'

export const runtime = 'edge'

const size = {
  width: 1200,
  height: 630
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.pathname
    .replace('/og', '')
    .split('/')
    .pop() as Id<'users'>

  const montserratMedium = fetch(
    new URL(
      '../../../../../../public/fonts/Montserrat-Medium.ttf',
      import.meta.url
    )
  ).then((res) => res.arrayBuffer())

  const montserratSemibold = fetch(
    new URL(
      '../../../../../../public/fonts/Montserrat-SemiBold.ttf',
      import.meta.url
    )
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(await OGImage({ userId }), {
    // For convenience, we can re-use the exported opengraph-image
    // size config to also set the ImageResponse's width and height.
    ...size,
    fonts: [
      {
        name: 'Montserrat',
        data: await montserratMedium,
        style: 'normal',
        weight: 500
      },
      {
        name: 'Montserrat',
        data: await montserratSemibold,
        style: 'normal',
        weight: 600
      }
    ]
  })
}

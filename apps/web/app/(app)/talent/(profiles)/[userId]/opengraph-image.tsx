import { Id } from '@packages/backend/convex/_generated/dataModel'
import { ImageResponse } from 'next/og'
import { OGImage } from './og/og-image'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Motiion Profile Card'
export const size = {
  width: 1200,
  height: 630
}

export const contentType = 'image/png'

// Image generation
export default async function OGImageMeta({
  params: { userId }
}: {
  params: { userId: Id<'users'> }
}) {
  // Font
  const montserratMedium = fetch(
    new URL(
      '../../../../../public/fonts/Montserrat-Medium.ttf',
      import.meta.url
    )
  ).then((res) => res.arrayBuffer())

  const montserratSemibold = fetch(
    new URL(
      '../../../../../public/fonts/Montserrat-SemiBold.ttf',
      import.meta.url
    )
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    await OGImage({ userId }),
    // ImageResponse options
    {
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
    }
  )
}

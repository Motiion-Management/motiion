'use client'
import ReactPlayer from 'react-player'
import { AspectRatio } from './aspect-ratio'
import { FC } from 'react'

export const Video: FC<{ url: string }> = ({ url }) => {
  return (
    <AspectRatio ratio={16 / 9}>
      <div className="h-full w-full overflow-clip rounded-xl">
        <ReactPlayer
          playsinline
          width="100%"
          height="100%"
          controls
          config={{
            youtube: {
              playerVars: {
                start: 113
              }
            }
          }}
          url={url}
        />
      </div>
    </AspectRatio>
  )
}

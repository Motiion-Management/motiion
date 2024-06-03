import ReactCardFlip from 'react-card-flip'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useState } from 'react'

export const CardFlip: React.FC<{
  frontSlot: React.ReactNode
  backSlot: React.ReactNode
}> = ({ frontSlot, backSlot }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  function flip() {
    setIsFlipped(!isFlipped)
  }

  return (
    <AspectRatio
      ratio={24 / 41}
      className="h-full w-auto group-data-[open=true]:pointer-events-none"
      id="ar"
    >
      <ReactCardFlip
        cardStyles={{
          front: { zIndex: 'unset', transformStyle: 'initial' },
          back: { zIndex: 'unset', transformStyle: 'initial' }
        }}
        isFlipped={isFlipped}
        flipDirection="horizontal"
      >
        {frontSlot}
        {backSlot}
      </ReactCardFlip>
    </AspectRatio>
  )
}

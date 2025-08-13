'use client'

import { api } from '@packages/backend/convex/_generated/api'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import Image from 'next/image'
import { Circle, Ellipsis } from 'lucide-react'
import {
  type CarouselApi,
  CarouselItem,
  CarouselContent,
  Carousel
} from '@/components/ui/carousel'

import {
  DialogCloseX,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { AspectRatio } from '../ui/aspect-ratio'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { useEffect, useState } from 'react'

export const HeadshotModalContent = ({
  preloadedHeadshots
}: {
  preloadedHeadshots: Preloaded<typeof api.users.headshots.getMyHeadshots>
}) => {
  const [carousel, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const headshots = usePreloadedQuery(preloadedHeadshots)
  const removeHeadshot = useMutation(api.users.headshots.removeHeadshot)

  useEffect(() => {
    if (!carousel) {
      return
    }

    setCount(carousel.scrollSnapList().length)
    setCurrent(carousel.selectedScrollSnap() + 1)

    carousel.on('select', () => {
      setCurrent(carousel.selectedScrollSnap() + 1)
    })
  }, [carousel])

  console.log('count', count)
  return (
    <DialogContent
      className="bg-background grid h-full w-full grid-rows-[auto_1fr] border-none shadow-none"
      overlayClassName="bg-background"
    >
      <DialogHeader className="grid grid-cols-[auto_1fr_auto] items-center">
        <DialogCloseX />
        <DialogTitle className="grid place-items-center">Headshots</DialogTitle>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="link" size="icon">
              <Ellipsis size={24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mx-4">
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                removeHeadshot({ headshotId: headshots[current - 1].storageId })
              }
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DialogHeader>
      <div className="">
        <Carousel setApi={setApi}>
          <CarouselContent>
            {headshots.map((headshot, index) => (
              <CarouselItem key={index}>
                <AspectRatio ratio={100 / 148}>
                  <Image
                    className="rounded-lg object-cover"
                    key={headshot.title || headshot.url}
                    src={headshot.url || ''}
                    layout="fill"
                    alt={headshot.title || 'Headshot'}
                  />
                </AspectRatio>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex justify-center gap-4 p-4">
          {Array(count)
            .fill('_')
            .map((_, index) => (
              <Circle
                key={index}
                size={12}
                className={`stroke-transparent transition-colors ${index === current - 1 ? 'fill-ring' : 'fill-border'}`}
              />
            ))}
        </div>
      </div>
    </DialogContent>
  )
}

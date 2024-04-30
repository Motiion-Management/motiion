'use client'
import { useState, useEffect } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'

import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselApi,
} from '@/components/ui/carousel'

export default function Vision() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(1)
  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])
  const handleNextClick = () => {
    if (api) {
      api.scrollNext()
    }
  }
  return (
    <div className="flex min-h-screen w-full flex-col ">
      <main className="bg-background flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col justify-between gap-4 p-4 md:gap-8 md:p-10">
        <Carousel setApi={setApi}>
          <CarouselContent>
            <>
              <CarouselItem>
                <div className="mx-auto my-24 grid w-full max-w-6xl gap-2">
                  <h1 className="pb-10 text-4xl font-semibold">
                    The dance ecosystem in{' '}
                    <span className="text-accent">motiion</span>
                  </h1>
                  <p className="text-xl">
                    Our mission is to empower dancers with innovative tools and
                    resources to enhance their mental health, financial
                    stability, and creative expression, fostering a vibrant and
                    sustainable ecosystem.
                  </p>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="mx-auto my-24 grid w-full max-w-6xl gap-2">
                  <h2 className="pb-3 text-4xl font-semibold leading-[4rem]">
                    Update resume.
                    <br />
                    <span className="text-accent">Manage headshots.</span>
                    <br /> & more...
                  </h2>
                  <p className="text-xl">all-in-one platform.</p>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="mx-auto my-24 grid w-full max-w-6xl gap-2">
                  <h2 className="pb-3 text-4xl font-semibold leading-[4rem]">
                    Sign In
                  </h2>
                </div>
              </CarouselItem>
            </>
          </CarouselContent>
        </Carousel>
        <div className="mx-auto mb-8 grid w-full max-w-6xl gap-2">
          <div className="flex flex-col justify-center items-center pb-3">
            <svg className="mb-2"
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="8"
              viewBox="0 0 44 8"
              fill="none"
            >
              <circle
                cx="4"
                cy="4"
                r="4"
                fill={api?.selectedScrollSnap() === 0 ? '#00CCB6' : '#DFE3E7'}
              />
              <circle
                cx="22"
                cy="4"
                r="4"
                fill={api?.selectedScrollSnap() === 1 ? '#00CCB6' : '#DFE3E7'}
              />
              <circle
                cx="40"
                cy="4"
                r="4"
                fill={api?.selectedScrollSnap() === 2 ? '#00CCB6' : '#DFE3E7'}
              />
            </svg>
          </div>
            <hr className="w-screen" />
          <Button
            onClick={handleNextClick}
            className="mt-4 text-background rounded-full font-semibold"
            size="rounded"
            variant="default"
          >
            Next
          </Button>
        </div>
      </main>
    </div>
  )
}

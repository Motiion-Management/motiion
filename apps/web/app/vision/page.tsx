"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselApi,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

export default function Vision() {
  const [api, setApi] = useState<CarouselApi>()

  const handleNextClick = () => {
    if (api) {
      api.scrollNext()

    }
  }
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="bg-background flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col justify-between gap-4 p-4 md:gap-8 md:p-10">
        <Carousel  setApi={setApi}>
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
                  resources to enhance their mental health, financial stability,
                  and creative expression, fostering a vibrant and sustainable
                  ecosystem.
                </p>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="mx-auto my-24 grid w-full max-w-6xl gap-2">
                <h2 className="pb-10 text-4xl font-semibold">
                  Update resume.
                  <br />
                  <span className="text-accent">Manage headshots.</span>
                  <br /> & more...
                </h2>
              </div>
            </CarouselItem>
            </>
          </CarouselContent>
        </Carousel>

        <div className="mx-auto mb-8 grid w-full max-w-6xl gap-2">
          <Button onClick={handleNextClick}
            className="rounded-full font-semibold text-background"
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

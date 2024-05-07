'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselApi
} from '@/components/ui/carousel'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { useRouter } from 'next/navigation'

export default function Vision() {
  const [carousel, setCarousel] = useState<CarouselApi>()
  const [current, setCurrent] = useState(1)
  current
  useEffect(() => {
    if (!carousel) {
      return
    }

    setCurrent(carousel.selectedScrollSnap() + 1)

    carousel.on('select', () => {
      setCurrent(carousel.selectedScrollSnap() + 1)
    })
  }, [carousel])
  const handleNextClick = () => {
    if (carousel) {
      carousel.scrollNext()
    }
  }

  const router = useRouter()
  const user = useQuery(api.users.getMyUser)
  const updateMyUser = useMutation(api.users.updateMyUser)
  const nextStep = async () => {
    await updateMyUser({
      id: user!._id,
      patch: { onboardingStep: ONBOARDING_STEPS.PERSONAL_INFO }
    })

    router.push(`/onboarding/${ONBOARDING_STEPS.PERSONAL_INFO}`)
  }

  return (
    <div className="flex h-full flex-col justify-between gap-4 md:gap-8">
      <Carousel setApi={setCarousel}>
        <CarouselContent className="p4 h-full">
          <>
            <CarouselItem className="splash_carousel_vision">
              <div className="mx-auto my-24 grid w-full max-w-6xl gap-2 p-4">
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
            <CarouselItem className="splash_carousel_features">
              <div className="mx-auto my-24 grid w-full max-w-6xl gap-2 p-4">
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
      <div className="mx-auto mb-8 grid w-full gap-2">
        <div className="flex flex-col items-center justify-center pb-3">
          <svg
            className="mb-2 w-full"
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
              fill={
                carousel?.selectedScrollSnap() === 0 ? '#00CCB6' : '#DFE3E7'
              }
            />
            <circle
              cx="22"
              cy="4"
              r="4"
              fill={
                carousel?.selectedScrollSnap() === 1 ? '#00CCB6' : '#DFE3E7'
              }
            />
          </svg>
        </div>
        <Button
          onClick={
            carousel?.selectedScrollSnap() === 1 ? nextStep : handleNextClick
          }
          className=""
        >
          {carousel?.selectedScrollSnap() === 1 ? `Let's Get Started` : 'Next'}
        </Button>
      </div>
    </div>
  )
}

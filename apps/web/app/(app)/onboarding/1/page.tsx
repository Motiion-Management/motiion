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
import { Circle } from 'lucide-react'
import { Motif2 } from './motif-2'
import { Motif3 } from './motif-3'
import { Motif4 } from './motif-4'
import { useRouter } from 'next/navigation'
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users'

const Slide = ({
  title,
  accent,
  description
}: {
  title: string
  accent: string
  description: string
}) => (
  <div className="ml-4 grid gap-8 pr-4">
    <h1 className="text-h1 w-[80%]">
      {title}
      <br />
      <span className="text-accent">{accent}</span>.
    </h1>
    <p className="text-body-lg">{description}</p>
  </div>
)
export default function Vision() {
  const [carousel, setCarousel] = useState<CarouselApi>()
  const [current, setCurrent] = useState(1)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!carousel) {
      return
    }

    setCurrent(carousel.selectedScrollSnap())

    carousel.on('select', () => {
      setCurrent(carousel.selectedScrollSnap())
    })
  }, [carousel])

  const router = useRouter()

  const handleNextClick = () => {
    if (carousel) {
      carousel.scrollNext()
    }
  }

  const user = useQuery(api.users.getMyUser)
  const updateMyUser = useMutation(api.users.update)

  const nextStep = async () => {
    router.prefetch('/onboarding/2')
    setLoading(true)
    if (user?.onboardingStep === ONBOARDING_STEPS.PROFILE_TYPE) {
      // User will advance to profile type selection step
      // The actual profile type selection should happen on the next page
      router.push('/onboarding/2')
      return
    }
    router.push('/onboarding/2')
  }

  const carouselItems = [
    {
      slide: {
        title: 'The dance ecosystem in',
        accent: 'motiion',
        description:
          'We aim to empower dancers with innovative tools and resources to enhance their mental health, financial stability, and creative expression, fostering a vibrant and sustainable ecosystem.'
      },
      button: { children: `Next`, onClick: handleNextClick },
      images: [Motif2, Motif3]
    },
    {
      slide: {
        title: 'The online database for',
        accent: 'dance talent',
        description:
          'Tools to help you manage your resume and headshots all in one platform.'
      },
      button: { children: `Let's Get Started`, onClick: nextStep },
      images: [Motif4]
    }
  ]
  return (
    <div className="relative -left-4 -mr-4 grid h-full grid-cols-1 grid-rows-[1fr_min-content]">
      <Carousel
        setApi={setCarousel}
        className="grid h-full w-screen max-w-[calc(100%+16px)] cursor-grab auto-cols-auto active:cursor-grabbing"
      >
        <CarouselContent className="h-full overflow-y-visible">
          {carouselItems.map((item) => (
            <CarouselItem key={item.slide.title}>
              <div className="absolute left-0 top-0 -z-10 grid h-full w-full items-end justify-items-center">
                {item.images.map((Motif, i) => (
                  <Motif key={`motif-${i}`} />
                ))}
              </div>

              <Slide {...item.slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="ml-4 grid place-items-center gap-4">
        <div className="flex gap-2">
          {carouselItems.map((_, i) => (
            <Circle
              onClick={() => carousel?.scrollTo(i)}
              key={i}
              size={10}
              className={`${
                i === current
                  ? 'fill-accent stroke-accent'
                  : 'fill-white stroke-white'
              }`}
            />
          ))}
        </div>
        <Button
          loading={loading}
          {...carouselItems[current].button}
          className="w-full"
        />
      </div>
    </div>
  )
}

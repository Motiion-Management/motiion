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
import { Circle } from 'lucide-react'

const Slide = ({
  title,
  accent,
  description
}: {
  title: string
  accent: string
  description: string
}) => (
  <div className="grid gap-8">
    <h1 className="text-4xl font-semibold">
      {title}
      <br />
      <span className="text-accent">{accent}</span>.
    </h1>
    <p className="text-xl">{description}</p>
  </div>
)
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

  const carouselItems = [
    {
      slide: {
        title: 'The dance ecosystem in',
        accent: 'motiion',
        description:
          'We aim to empower dancers with innovative tools and resources to enhance their mental health, financial stability, and creative expression, fostering a vibrant and sustainable ecosystem.'
      },
      button: { children: `Next`, onClick: handleNextClick }
    },
    {
      slide: {
        title: 'The online database for',
        accent: 'dance talent',
        description:
          'Tools to help you manage your resume and headshots all in one platform.'
      },
      button: { children: `Let's Get Started`, onClick: nextStep }
    }
  ]
  return (
    <div className="grid h-full grid-cols-1 grid-rows-[1fr_min-content] gap-4 md:gap-8">
      <Carousel
        setApi={setCarousel}
        className="grid cursor-grab auto-cols-auto active:cursor-grabbing"
      >
        <CarouselContent className="">
          {carouselItems.map((item) => (
            <CarouselItem key={item.slide.title}>
              <Slide {...item.slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="grid place-items-center gap-2">
        <div className="flex gap-2">
          {carouselItems.map((_, i) => (
            <Circle
              onClick={() => carousel?.scrollTo(i)}
              key={i}
              size={10}
              className={`${
                i === current - 1
                  ? 'fill-accent stroke-accent'
                  : 'fill-white stroke-white'
              }`}
            />
          ))}
        </div>
        <Button {...carouselItems[current - 1].button} className="w-full" />
      </div>
    </div>
  )
}

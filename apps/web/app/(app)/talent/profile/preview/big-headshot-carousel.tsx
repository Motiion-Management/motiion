import { useState, useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import Image from 'next/image'
import { Progress } from '@/components/ui/progress'
import {
  CarouselApi,
  Carousel,
  CarouselItem,
  CarouselContent
} from '@/components/ui/carousel'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { UserDoc } from '@packages/backend/convex/users'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import './profile-card.css'
import FlipArrowWhite from '@/public/profile-flip-arrow-white.svg'
import { Button } from '@/components/ui/button'
import { PreviewTabs } from './preview-tabs'

export function BigHeadshotCarousel({
  user,
  flip
}: {
  user: UserDoc
  flip: () => void
}) {
  const headshots = useQuery(api.resumes.getMyHeadshots)
  const [carousel, setCarousel] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [isShrunk, setIsShrunk] = useState(false)
  const previewTabsRef = useRef(null);
  const carouselContainerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if(entry.isIntersecting) {
          carouselContainerRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      },
      { threshold: 0.1 }
    )
    if (previewTabsRef.current) {
      observer.observe(previewTabsRef.current);
    }
    return () => {
      if (previewTabsRef.current) {
        observer.unobserve(previewTabsRef.current);
      }
    }
  }, [])


  useEffect(() => {
    if (!carousel) {
      return
    }

    setCurrent(carousel.selectedScrollSnap())

    carousel.on('select', () => {
      setCurrent(carousel.selectedScrollSnap())
    })
  }, [carousel])

  function scrollNext() {
    if (carousel && carousel.canScrollNext()) {
      carousel.scrollNext(true)
    }
  }
  function scrollPrevious() {
    if (carousel && carousel.canScrollPrev()) {
      carousel.scrollPrev(true)
    }
  }
  return (
    <main className="carousel-preview-container">
      <section
        className={` ${isShrunk ? 'shrunk' : ''}`}
      >
    

        <div
          ref={carouselContainerRef}
          className={`carousel-container relative grid ${isShrunk ? 'shrunk' : ''}`}
          onClick={() => carouselContainerRef.current.scrollIntoView({ behavior: 'smooth' })}

        >
          <div className="flex justify-center gap-5 pt-3">
            {headshots && headshots.length > 0
              ? headshots.map((headshot, index) => (
                  <Progress
                    className={
                      current === index
                        ? 'bg-accent z-10 h-2 w-16'
                        : 'bg-background z-10 h-2 w-16'
                    }
                    key={index}
                  />
                ))
              : null}
          </div>
          <div className="text-primary-foreground absolute left-4 top-4 z-10 flex flex-col">
            <div className="text-h3 pt-4">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-h5">{user.location?.city}</div>
          </div>

          <Carousel
            setApi={setCarousel}
            className="left-0 top-0 w-full"
          >
            <CarouselContent>
              {headshots && headshots.length > 0 ? (
                headshots.map((headshot, index) => (
                  <CarouselItem key={index} className="w-full basis-auto">
                    <AspectRatio
                      key={index}
                      ratio={24 / 41}
                      className="w-full"
                      id="ar"
                    >
                      <Image
                        key={headshot.title || headshot.url}
                        src={headshot.url || ''}
                        width={400}
                        height={600}
                        className="h-full w-full rounded-xl object-cover"
                        alt={headshot.title || 'Headshot'}
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))
              ) : (
                <div>No headshots available</div> // Fallback UI when there are no headshots
              )}
            </CarouselContent>

            <Button
              size="icon"
              onClick={flip}
              className="absolute bottom-9 right-5 z-[1000]"
            >
              <Image src={FlipArrowWhite} alt="" />
            </Button>

            <button
              className="absolute left-0 top-0 z-50 h-full w-1/4 "
              onClick={scrollPrevious}
            />

            <button
              className="absolute right-0 top-0 z-50 h-full w-1/4 "
              onClick={scrollNext}
            />
          </Carousel>

        </div>
   
      </section>
        <PreviewTabs
          snapTarget="preview"
        />
    </main>
  )
}

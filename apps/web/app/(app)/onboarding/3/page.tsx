import placeholder from '@/public/images/upload-image-placeholder.png'
import { HeadshotCarousel } from '@/components/features/headshot-carousel'
import { BottomButton } from './button'

export default async function Headshot() {
  return (
    <section className="mt-4 grid h-full w-full grid-cols-1 grid-rows-[1fr_min-content] gap-8">
      <HeadshotCarousel
        title="Headshots"
        placeholderText={`Upload at least one headshot to continue setting up your account. Your headshot(s) will be viewable to the public.`}
        placeholderImage={placeholder}
        onboarding
      />
      <div className="sticky bottom-0 w-full ">
        <BottomButton />
      </div>
    </section>
  )
}

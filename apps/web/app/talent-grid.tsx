import Image from 'next/image'

function TalentGridImage() {
  return (
    <Image
      src="/landing-page-images/talent-grid.png"
      alt="Talent Grid"
      fill
      className="object-cover"
    />
  )
}
export function TalentGrid() {
  return (
    <div className="absolute left-0 top-0 -z-10 flex h-screen w-screen flex-col items-center justify-center">
      <TalentGridImage />
    </div>
  )
}

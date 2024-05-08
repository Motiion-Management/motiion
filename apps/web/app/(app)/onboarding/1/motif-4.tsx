import Image from 'next/image'
import motif4 from '@/public/svgs/motif-4.svg'

export function Motif4() {
  return (
    <Image
      src={motif4}
      alt="Motif 2"
      height={200}
      width={200}
      className="absolute bottom-10 right-1/4 -m-[40px] h-min"
    />
  )
}
